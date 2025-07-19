import { ImageUpload } from '@/components/image-upload';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">CrowdLense</h1>
          <p className="text-gray-600">Share your moments anonymously</p>
        </div>

        <ImageUpload />
      </div>
    </div>
  );
}
