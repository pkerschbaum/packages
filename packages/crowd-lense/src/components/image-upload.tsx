'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { validateImageFile } from '@/lib/utils';
import { Upload, Camera, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

interface UploadedFile {
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

export function ImageUpload() {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;

      const fileArray = Array.from(newFiles);

      if (files.length + fileArray.length > 10) {
        alert('Maximum 10 files allowed');
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
    },
    [files.length],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      e.target.value = '';
    },
    [handleFiles],
  );

  const uploadFiles = async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    const formData = new FormData();
    pendingFiles.forEach(({ file }) => {
      formData.append('files', file);
    });

    // Update status to uploading
    setFiles((prev) =>
      prev.map((f) =>
        f.status === 'pending' ? { ...f, status: 'uploading' as const, progress: 0 } : f,
      ),
    );

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = (e.loaded / e.total) * 100;
          setFiles((prev) => prev.map((f) => (f.status === 'uploading' ? { ...f, progress } : f)));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          setFiles((prev) =>
            prev.map((f) =>
              f.status === 'uploading' ? { ...f, status: 'success' as const, progress: 100 } : f,
            ),
          );
        } else {
          setFiles((prev) =>
            prev.map((f) =>
              f.status === 'uploading'
                ? { ...f, status: 'error' as const, error: 'Upload failed' }
                : f,
            ),
          );
        }
      };

      xhr.onerror = () => {
        setFiles((prev) =>
          prev.map((f) =>
            f.status === 'uploading'
              ? { ...f, status: 'error' as const, error: 'Upload failed' }
              : f,
          ),
        );
      };

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
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

  const clearAll = () => {
    files.forEach((f) => URL.revokeObjectURL(f.preview));
    setFiles([]);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Upload Zone */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div className="space-y-4">
          <div className="flex justify-center">
            <Upload className="w-12 h-12 text-gray-400" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">Drop images here or tap to select</p>
            <p className="text-sm text-gray-500 mt-1">
              JPEG, PNG, GIF, WebP up to 30MB each (max 10 files)
            </p>
          </div>
          <div className="flex justify-center space-x-4">
            <Button variant="outline" size="sm">
              <Camera className="w-4 h-4 mr-2" />
              Camera
            </Button>
            <Button variant="outline" size="sm">
              <ImageIcon className="w-4 h-4 mr-2" />
              Gallery
            </Button>
          </div>
        </div>
      </div>

      <input
        id="file-input"
        type="file"
        multiple
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileInput}
        className="hidden"
      />

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Selected Files ({files.length}/10)</h3>
            <Button variant="outline" size="sm" onClick={clearAll}>
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
                <div className="flex items-center space-x-2">
                  {file.status === 'success' && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {file.status === 'error' && <AlertCircle className="w-5 h-5 text-red-500" />}
                  <Button variant="outline" size="sm" onClick={() => removeFile(index)}>
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              onClick={uploadFiles}
              disabled={!files.some((f) => f.status === 'pending')}
              className="min-w-32"
            >
              Upload {files.filter((f) => f.status === 'pending').length} Files
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
