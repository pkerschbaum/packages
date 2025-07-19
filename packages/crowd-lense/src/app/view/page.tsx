'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import Image from 'next/image';
import QRCode from 'qrcode';

interface CarouselImage {
  id: string;
  filename: string;
  blobUrl: string;
  uploadTimestamp: string;
  isPromo?: boolean;
}

export default function CarouselPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

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
    QRCode.toDataURL('https://crowd-lense.pkerschbaum.dev', {
      width: 150,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })
      .then(setQrCodeUrl)
      .catch(console.error);
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  if (isLoading || images.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading images...</p>
        </div>
      </div>
    );
  }

  const currentImage = images[currentIndex];
  const nextImages = images.slice(currentIndex + 1, currentIndex + 6);

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
            unoptimized={currentImage.isPromo}
          />
          {currentImage.isPromo && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
              Sponsored
            </div>
          )}
        </div>
      </div>

      {/* QR Code - Bottom Left */}
      {qrCodeUrl && (
        <div className="absolute bottom-6 left-6 z-10">
          <div className="bg-white p-3 rounded-lg shadow-lg">
            <img src={qrCodeUrl} alt="Upload QR Code" className="w-24 h-24" />
            <p className="text-xs text-center mt-2 text-black font-medium">Upload Images</p>
          </div>
        </div>
      )}

      {/* Preview - Bottom Right */}
      {nextImages.length > 0 && (
        <div className="absolute bottom-6 right-6 z-10">
          <div className="bg-black bg-opacity-50 p-3 rounded-lg">
            <p className="text-white text-xs mb-2 text-center">Coming Up</p>
            <div className="flex space-x-2">
              {nextImages.map((image: CarouselImage, index: number) => (
                <div
                  key={image.id}
                  className="relative w-12 h-12 rounded overflow-hidden border-2 border-white"
                >
                  <Image
                    src={image.blobUrl}
                    alt={`Preview ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized={image.isPromo}
                  />
                  {image.isPromo && (
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-500 to-transparent opacity-70"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Progress Indicator */}
      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm">
          {currentIndex + 1} / {images.length}
        </div>
      </div>

      {/* Touch Controls for Mobile */}
      <div className="absolute inset-0 z-5 flex">
        <div
          className="w-1/2 h-full cursor-pointer"
          onClick={() => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
        />
        <div
          className="w-1/2 h-full cursor-pointer"
          onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
        />
      </div>
    </div>
  );
}
