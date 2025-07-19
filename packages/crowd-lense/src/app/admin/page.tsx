'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Clock, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface Image {
  id: string;
  filename: string;
  originalFilename: string;
  uploadTimestamp: string;
  status: string;
  mimeType: string;
  fileSize: number;
  blobUrl: string;
}

export default function AdminPage() {
  const [credentials, setCredentials] = useState<{ username: string; password: string } | null>(
    null,
  );
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const queryClient = useQueryClient();

  const {
    data: images = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['admin-images'],
    queryFn: async () => {
      if (!credentials) return [];

      const auth = btoa(`${credentials.username}:${credentials.password}`);
      const response = await fetch('/api/admin/images?status=PENDING', {
        headers: { Authorization: `Basic ${auth}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setCredentials(null);
          throw new Error('Unauthorized');
        }
        throw new Error('Failed to fetch images');
      }

      return response.json();
    },
    enabled: !!credentials,
    refetchInterval: 5000,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({
      imageId,
      status,
    }: {
      imageId: string;
      status: 'APPROVED' | 'REJECTED';
    }) => {
      if (!credentials) throw new Error('Not authenticated');

      const auth = btoa(`${credentials.username}:${credentials.password}`);
      const response = await fetch('/api/admin/images', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({ imageId, status }),
      });

      if (!response.ok) throw new Error('Failed to update image');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-images'] });
      // Auto-advance to next image
      if (currentImageIndex < images.length - 1) {
        setCurrentImageIndex((prev) => prev + 1);
      } else {
        setCurrentImageIndex(0);
      }
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setCredentials(loginForm);
  };


  const handleReview = (status: 'APPROVED' | 'REJECTED') => {
    const currentImage = images[currentImageIndex];
    if (currentImage) {
      reviewMutation.mutate({ imageId: currentImage.id, status });
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading images...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center text-red-600">
          <p>Error loading images</p>
          <Button onClick={() => setCredentials(null)} className="mt-4">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Pending Images</h2>
          <p className="text-gray-500">All images have been reviewed!</p>
          <Button onClick={() => setCredentials(null)} className="mt-4">
            Logout
          </Button>
        </div>
      </div>
    );
  }

  const currentImage = images[currentImageIndex];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">Admin Review</h1>
            <p className="text-sm text-gray-300">
              {currentImageIndex + 1} of {images.length} pending
            </p>
          </div>
          <div className="flex space-x-2">
            <Link href="/admin/promo">
              <Button variant="outline" size="sm">
                Manage Promos
              </Button>
            </Link>
            <Button variant="outline" onClick={() => setCredentials(null)}>
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Image */}
      <div className="relative w-full h-screen flex items-center justify-center">
        <img
          src={currentImage.blobUrl}
          alt={currentImage.originalFilename}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-black bg-opacity-50 p-4">
        <div className="flex justify-center space-x-4 mb-4">
          <Button
            onClick={() => handleReview('REJECTED')}
            variant="destructive"
            size="lg"
            disabled={reviewMutation.isPending}
          >
            <XCircle className="w-5 h-5 mr-2" />
            Reject
          </Button>
          <Button
            onClick={() => handleReview('APPROVED')}
            size="lg"
            disabled={reviewMutation.isPending}
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Approve
          </Button>
        </div>

        {/* Image Info */}
        <div className="text-center text-sm text-gray-300">
          <p>{currentImage.originalFilename}</p>
          <p>
            {new Date(currentImage.uploadTimestamp).toLocaleDateString()} •
            {(currentImage.fileSize / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-center space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentImageIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentImageIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentImageIndex((prev) => Math.min(prev + 1, images.length - 1))}
            disabled={currentImageIndex === images.length - 1}
          >
            Next
          </Button>
        </div>

      </div>
    </div>
  );
}
