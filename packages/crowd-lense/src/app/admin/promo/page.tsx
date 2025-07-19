'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { validateImageFile } from '@/lib/utils';
import { Upload, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

interface UploadedFile {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export default function PromoManagementPage() {
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(
    null,
  );
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const queryClient = useQueryClient();

  const { data: promoImages = [], isLoading } = useQuery({
    queryKey: ['promo-images'],
    queryFn: async () => {
      if (!credentials) return [];

      const auth = btoa(`${credentials.username}:${credentials.password}`);
      const response = await fetch('/api/admin/promo', {
        headers: { Authorization: `Basic ${auth}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setCredentials(null);
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch promotional images');
      }

      const data = await response.json();
      return data.images;
    },
    enabled: !!credentials,
  });

  const uploadMutation = useMutation({
    mutationFn: async (filesToUpload: File[]) => {
      if (!credentials) throw new Error('Not authenticated');

      const formData = new FormData();
      filesToUpload.forEach((file) => formData.append('files', file));

      const auth = btoa(`${credentials.username}:${credentials.password}`);
      const response = await fetch('/api/admin/promo', {
        method: 'POST',
        headers: { Authorization: `Basic ${auth}` },
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to upload promotional images');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-images'] });
      setFiles([]);
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCredentials(loginForm);
  };

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const fileArray = Array.from(newFiles);

    if (files.length + fileArray.length > 5) {
      alert('Maximum 5 promotional images allowed per upload');
      return;
    }

    const processedFiles = fileArray.map((file) => {
      const validation = validateImageFile(file);
      return {
        file,
        preview: URL.createObjectURL(file),
        status: validation.valid ? ('pending' as const) : ('error' as const),
        progress: 0,
        error: validation.error,
      };
    });

    setFiles((prev) => [...prev, ...processedFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const uploadFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'pending' ? { ...f, status: 'uploading' as const, progress: 50 } : f,
      ),
    );

    try {
      await uploadMutation.mutateAsync(pendingFiles.map((f) => f.file));
      setFiles((prev) =>
        prev.map((f) =>
          f.status === 'uploading' ? { ...f, status: 'success' as const, progress: 100 } : f,
        ),
      );
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.status === 'uploading' ? { ...f, status: 'error' as const, error: 'Upload failed' } : f,
        ),
      );
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  if (!credentials) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Promotional Images</h1>
            <p className="text-gray-600">Manage images shown in the carousel every 5th position</p>
          </div>
          <div className="flex space-x-4">
            <Link href="/admin">
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Review Images
              </Button>
            </Link>
            <Button variant="outline" onClick={() => setCredentials(null)}>
              Logout
            </Button>
          </div>
        </div>

        {/* Current Promotional Images */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            Current Promotional Images ({promoImages.length})
          </h2>
          {isLoading ? (
            <p>Loading promotional images...</p>
          ) : promoImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {promoImages.map((imageUrl: string, index: number) => (
                <div key={index} className="relative">
                  <img
                    src={imageUrl}
                    alt={`Promotional image ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No promotional images uploaded yet.</p>
          )}
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Upload New Promotional Images</h2>

          {/* Upload Zone */}
          <div
            className={`
              border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer mb-6
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
            `}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onClick={() => document.getElementById('promo-file-input')?.click()}
          >
            <div className="space-y-4">
              <div className="flex justify-center">
                <Upload className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Drop promotional images here or click to select
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  JPEG, PNG, GIF, WebP up to 30MB each (max 5 files)
                </p>
              </div>
            </div>
          </div>

          <input
            id="promo-file-input"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={(e) => handleFiles(e.target.files)}
            className="hidden"
          />

          {/* File List */}
          {files.length > 0 && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Selected Files ({files.length}/5)</h3>
                <Button variant="outline" size="sm" onClick={() => setFiles([])}>
                  Clear All
                </Button>
              </div>

              <div className="space-y-3">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{file.file.name}</p>
                      <p className="text-xs text-gray-500">
                        {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {file.status === 'uploading' && (
                        <Progress value={file.progress} className="mt-2" />
                      )}
                      {file.error && <p className="text-xs text-red-500 mt-1">{file.error}</p>}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => removeFile(index)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={uploadFiles}
                  disabled={!files.some((f) => f.status === 'pending') || uploadMutation.isPending}
                  className="min-w-32"
                >
                  Upload {files.filter((f) => f.status === 'pending').length} Files
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
