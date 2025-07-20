'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import QRCode from 'qrcode';

type CarouselImage = {
  id: string;
  filename: string;
  blobUrl: string;
  uploadTimestamp: string;
  isPromo?: boolean;
};

export default function CarouselPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const { data: images = [], isLoading } = useQuery({
    queryKey: ['carousel-images'],
    queryFn: async () => {
      const response = await fetch('/api/carousel');
      if (!response.ok) throw new Error('Failed to fetch images');
      return response.json();
    },
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  // Generate QR code for upload URL
  useEffect(() => {
    async function generateQrCode() {
      const qrCode = await QRCode.toDataURL('https://crowd-lense.pkerschbaum.dev/upload', {
        width: 150,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(qrCode);
    }
    void generateQrCode();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading images...</p>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">No images found</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];
  const nextImages = [];
  const maxPreviewImages = Math.min(5, images.length - 1); // Don't show more than available unique images
  for (let i = 1; i <= maxPreviewImages; i++) {
    const nextIndex = (currentIndex + i) % images.length;
    nextImages.push(images[nextIndex]);
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Main Image */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full">
          <Image
            src={currentImage.blobUrl}
            alt={`Image ${currentIndex + 1}`}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* QR Code - Bottom Left */}
      {qrCodeUrl && (
        <div className="absolute bottom-6 left-6 z-10">
          <div className="bg-white p-3 rounded-lg shadow-lg flex flex-col items-center">
            <div className="relative w-32 h-32">
              <Image
                src={qrCodeUrl}
                alt="Upload QR Code"
                fill
                className="object-contain"
                sizes="96px"
              />
            </div>
            <p className="text-md text-center mt-2 text-black font-medium">Bilder hochladen </p>
          </div>
        </div>
      )}

      {/* Preview - Bottom Right */}
      {nextImages.length > 0 && (
        <div className="absolute bottom-6 right-6 z-10 flex space-x-2">
          {nextImages
            .slice()
            .reverse()
            .map((image: CarouselImage, index: number) => (
              <div
                key={image.id}
                className="relative w-36 h-36 rounded overflow-hidden border-2 border-white"
              >
                <Image
                  src={image.blobUrl}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
