import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyCredentials } from '@/lib/auth';

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

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'PENDING';

  try {
    const images = await prisma.image.findMany({
      where: { status: status as any },
      orderBy: { uploadTimestamp: 'asc' },
      take: 50,
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Failed to fetch images:', error);
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const isAuthenticated = await authenticateRequest(request);
  if (!isAuthenticated) {
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'WWW-Authenticate': 'Basic realm="Admin Access"' },
    });
  }

  try {
    const body = await request.json();
    const { imageId, status } = body;

    if (!imageId || !['APPROVED', 'REJECTED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
    }

    const image = await prisma.image.update({
      where: { id: imageId },
      data: {
        status,
        reviewTimestamp: new Date(),
      },
    });

    return NextResponse.json({ success: true, image });
  } catch (error) {
    console.error('Failed to update image:', error);
    return NextResponse.json({ error: 'Failed to update image' }, { status: 500 });
  }
}
