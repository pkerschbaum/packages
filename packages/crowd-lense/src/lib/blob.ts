import { put, list } from '@vercel/blob';

export async function uploadToBlob(file: File): Promise<{ url: string; filename: string }> {
  const filename = `user-images/${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;

  const blob = await put(filename, file, {
    access: 'public',
  });

  return {
    url: blob.url,
    filename: blob.pathname.split('/').pop() || filename,
  };
}

export async function uploadPromotionalImage(
  file: File,
): Promise<{ url: string; filename: string }> {
  const filename = `promotional-images/${Date.now()}-${Math.random().toString(36).substring(2)}-${file.name}`;

  const blob = await put(filename, file, {
    access: 'public',
  });

  return {
    url: blob.url,
    filename: blob.pathname.split('/').pop() || filename,
  };
}

export async function getPromotionalImages() {
  try {
    const { blobs } = await list({
      prefix: 'promotional-images/',
    });

    return blobs;
  } catch (error) {
    console.error('Failed to fetch promotional images:', error);
    return [];
  }
}
