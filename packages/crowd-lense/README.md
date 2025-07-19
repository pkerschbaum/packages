# CrowdLense

Anonymous image upload and display system with admin moderation and automated carousel viewing.

## Features

- 📱 Mobile-optimized anonymous image uploads
- 🔐 Admin authentication and moderation dashboard
- 🎠 Automated image carousel with promotional content
- 📊 QR code generation for easy upload access
- 🔧 Built with Next.js, Prisma, and Vercel

## Setup Instructions

### Prerequisites

1. Node.js (see `.nvmrc` for version)
2. PostgreSQL database
3. Vercel account for blob storage
4. Google Cloud Storage bucket (for promotional images)

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
- `ADMIN_USERNAME`: Admin username (default: admin)
- `ADMIN_PASSWORD_HASH`: Bcrypt hash of admin password
- `SENTRY_DSN`: Sentry error tracking DSN

3. Generate admin password hash:

```bash
node scripts/generate-admin-hash.js "your-admin-password"
```

4. Set up database:

```bash
pnpm db:push
pnpm db:generate
```

### Development

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Database Management

- Generate Prisma client: `pnpm db:generate`
- Push schema changes: `pnpm db:push`
- Run migrations: `pnpm db:migrate`
- Open Prisma Studio: `pnpm db:studio`

## Usage

### Public Upload Interface

Visit the homepage to upload images anonymously. Supports:

- Multiple file formats (JPEG, PNG, GIF, WebP)
- Batch uploads (up to 10 files)
- Files up to 30MB each
- Mobile camera/gallery integration

### Admin Moderation

Visit `/admin` to review pending images:

- Login with admin credentials
- Review images sequentially
- Approve/reject with keyboard shortcuts (A/R)
- Auto-advance after decisions

### Promotional Image Management

Visit `/admin/promo` to manage promotional images:

- Upload promotional images to Vercel Blob
- View currently active promotional images
- Images are automatically inserted every 5th position in carousel

### Carousel Display

Visit `/view` for the automated slideshow:

- Fullscreen image display
- Promotional images every 5th position
- QR code for upload access
- Touch/click navigation
- Auto-advance every 5 seconds

## API Endpoints

- `POST /api/upload` - Upload images
- `GET /api/admin/images` - Get images for review (auth required)
- `PATCH /api/admin/images` - Update image status (auth required)
- `GET /api/carousel` - Get approved images for carousel
- `GET /api/admin/promo` - Get promotional images (auth required)
- `POST /api/admin/promo` - Upload promotional images (auth required)

## Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Database Setup

Set up a PostgreSQL database on Vercel, Railway, or your preferred provider:

```bash
# Example for Vercel Postgres
vercel env add DATABASE_URL
# Paste your database URL
```

### Blob Storage

Create a Vercel Blob store:

```bash
vercel blob store add crowd-lense-images
# Copy the token to BLOB_READ_WRITE_TOKEN
```

The blob storage automatically handles two subfolders:

- `user-images/` - User-uploaded images awaiting moderation
- `promotional-images/` - Admin-uploaded promotional content

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **File Storage**: Vercel Blob
- **Monitoring**: Sentry
- **Authentication**: HTTP Basic Auth with bcrypt

## Security Features

- File type validation
- File size limits (30MB)
- Rate limiting (10 uploads/minute/IP)
- CSRF protection
- XSS prevention
- HTTPS enforcement
- Secure credential handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

Private project - All rights reserved.
