# CrowdLense

Anonymous image upload and display system with admin moderation and automated carousel viewing.

## Features

- 📱 Mobile-optimized anonymous image uploads
- 🔐 Admin authentication and moderation dashboard  
- 🎠 Automated image carousel with promotional content insertion
- 📊 QR code generation for easy upload access
- 🔧 Built with Next.js 14, Prisma, and Vercel Blob Storage

## Setup Instructions

### Prerequisites

1. Node.js (see `.nvmrc` for version)
2. pnpm package manager (`corepack enable`)
3. PostgreSQL database
4. Vercel account for blob storage

### Installation

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Fill in the following variables:

- `DATABASE_URL`: PostgreSQL connection string
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token
- `ADMIN_USERNAME`: Admin username (for HTTP Basic Auth)
- `ADMIN_PASSWORD`: Admin password (plain text, will be hashed in auth)

3. Set up database:

```bash
pnpm db:push
pnpm db:generate
```

### Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000/upload](http://localhost:3000/upload) in your browser.

### Database Management

- Generate Prisma client: `pnpm db:generate`
- Push schema changes: `pnpm db:push`
- Run migrations: `pnpm db:migrate`
- Open Prisma Studio: `pnpm db:studio`

## Usage

### Public Upload Interface (/upload)

Upload images anonymously with:

- Multiple file formats (JPEG, PNG, GIF, WebP)
- Batch uploads (up to 10 files)
- Files up to 30MB each
- Mobile camera/gallery integration
- Image file validation and type checking

### Admin Moderation (/admin/review)

Review pending images with:

- HTTP Basic authentication
- Sequential image review interface
- Approve/reject buttons
- Real-time pending count
- Auto-refresh every 5 seconds
- Full-screen image preview

### Carousel Display (/view)

Automated slideshow featuring:

- Fullscreen image display
- Promotional images inserted every 5th position
- QR code linking to upload page (bottom-left)
- Preview of next 5 images (bottom-right)
- Auto-advance every 5 seconds
- Touch/click navigation support

## API Endpoints

- `POST /api/upload` - Upload images (creates pending entries)
- `GET /api/admin/images` - Get images by status (auth required)
- `PATCH /api/admin/images` - Update image status (auth required)
- `GET /api/carousel` - Get approved images with promotional content

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database Setup

Set up a PostgreSQL database (Neon, Vercel Postgres, or similar):

```bash
# Add your database URL to environment variables
DATABASE_URL="postgresql://..."
```

### Blob Storage Setup

Create a Vercel Blob store:

```bash
vercel blob store create
# Copy the token to BLOB_READ_WRITE_TOKEN
```

The blob storage uses two folders:

- `user-images/` - User-uploaded images (timestamped filenames)
- `promotional-images/` - Admin-uploaded promotional content

## Project Structure

```
src/
├── app/
│   ├── upload/           # Public upload page
│   ├── view/             # Carousel display
│   ├── admin/
│   │   └── review/       # Image moderation
│   └── api/              # API routes
├── components/
│   ├── image-upload.tsx  # Upload component
│   └── ui/               # UI components
└── lib/
    ├── auth.ts          # HTTP Basic Auth
    ├── blob.ts          # Vercel Blob integration
    ├── db.ts            # Prisma client
    └── utils.ts         # Utilities
```

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL with Prisma
- **File Storage**: Vercel Blob
- **Authentication**: HTTP Basic Auth with bcryptjs
- **Build Tools**: Turbo, pnpm workspaces

## Security Features

- File type validation (JPEG, PNG, GIF, WebP only)
- File size limits (30MB per file)
- Batch upload limits (max 10 files)
- HTTP Basic Auth for admin routes
- CSRF protection via Next.js
- Secure password hashing with bcryptjs

## License

Private project - All rights reserved.
