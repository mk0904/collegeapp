# UploadThing Setup Guide

## Quick Setup (5 minutes)

### 1. Install UploadThing
```bash
npm install uploadthing
```

### 2. Create UploadThing Account
- Go to [uploadthing.com](https://uploadthing.com)
- Sign up for free account
- Get your API keys

### 3. Add Environment Variables
Add to your `.env.local`:
```bash
NEXT_PUBLIC_UPLOADTHING_TOKEN=your_token_here
NEXT_PUBLIC_UPLOADTHING_SECRET=your_secret_here
```

### 4. Create API Route
Create `src/app/api/uploadthing/route.ts`:
```typescript
import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  circularUploader: f({ 
    image: { maxFileSize: "4MB", maxFileCount: 10 },
    pdf: { maxFileSize: "16MB", maxFileCount: 10 },
    video: { maxFileSize: "32MB", maxFileCount: 5 }
  })
    .middleware(() => {
      return {};
    })
    .onUploadComplete(() => {
      return {};
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
```

### 5. Update Circular Modal
Replace Firebase Storage import with:
```typescript
import { uploadMultipleFilesToUploadThing } from '@/lib/uploadthing-upload'
```

## Benefits of UploadThing
- ✅ **Free tier**: 2GB storage, 2GB bandwidth/month
- ✅ **Multiple files**: Upload up to 10 files at once
- ✅ **File types**: Images, PDFs, videos, documents
- ✅ **Reliable**: No account restrictions or preset issues
- ✅ **Next.js optimized**: Built specifically for Next.js
- ✅ **Simple setup**: Minimal configuration needed

## Alternative: Simple File Upload to Your Server
If you prefer to keep files on your own server:

```typescript
// Simple server-side file upload
export async function uploadToServer(files: File[]) {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  return response.json();
}
```

## Which option would you prefer?
1. **UploadThing** (Recommended - easiest setup)
2. **AWS S3** (Most reliable, but complex)
3. **Supabase Storage** (Good free tier)
4. **Server-side upload** (Keep files on your server)
5. **Stick with Firebase Storage** (Already working)

