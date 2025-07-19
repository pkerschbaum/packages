import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getPromotionalImages } from '@/lib/blob';

export async function GET(request: NextRequest) {
  try {
    const images = await prisma.image.findMany({
      where: { status: 'APPROVED' },
      orderBy: { uploadTimestamp: 'asc' },
      select: {
        id: true,
        filename: true,
        blobUrl: true,
        uploadTimestamp: true,
      },
    });

    // Insert promotional images every 5th position
    const promoImages = await getPromotionalImages();
    const result = [];

    for (let i = 0; i < images.length; i++) {
      result.push(images[i]);

      // Insert promo image every 5th position
      if ((i + 1) % 5 === 0 && promoImages.length > 0) {
        const promoIndex = Math.floor(i / 5) % promoImages.length;
        result.push({
          id: `promo-${promoIndex}`,
          filename: `promo-${promoIndex}`,
          blobUrl: promoImages[promoIndex],
          uploadTimestamp: new Date(),
          isPromo: true,
        });
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to fetch carousel images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}
