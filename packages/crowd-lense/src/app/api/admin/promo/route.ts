import { NextRequest, NextResponse } from 'next/server';
import { uploadPromotionalImage, getPromotionalImages } from '@/lib/blob';
import { verifyCredentials } from '@/lib/auth';
import { validateImageFile } from '@/lib/utils';

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false;
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');

  return verifyCredentials(username, password);
}

export async function GET(request: NextRequest) {
  const isAuthenticated = await authenticateRequest(request);
  if (!isAuthenticated) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin Access"' },
    });
  }

  try {
    const promoImages = await getPromotionalImages();
    return NextResponse.json({ images: promoImages.map((blob) => blob.url) });
  } catch (error) {
    console.error('Failed to fetch promotional images:', error);
    return NextResponse.json({ error: 'Failed to fetch promotional images' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const isAuthenticated = await authenticateRequest(request);
  if (!isAuthenticated) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin Access"' },
    });
  }

  try {
    const data = await request.formData();
    const files: File[] = data.getAll('files') as File[];

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    if (files.length > 5) {
      return NextResponse.json(
        { error: 'Maximum 5 promotional images allowed per upload' },
        { status: 400 },
      );
    }

    const results = [];

    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      try {
        const { url, filename } = await uploadPromotionalImage(file);
        results.push({ filename, url });
      } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
      }
    }

    return NextResponse.json({
      message: 'Promotional images uploaded successfully',
      count: results.length,
      files: results,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
