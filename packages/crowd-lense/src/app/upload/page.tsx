import { ImageUpload } from '@/components/image-upload';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <ImageUpload />
      </div>
    </div>
  );
}
