# Cloudinary Integration for College App

This document provides setup instructions for the Cloudinary integration in the College App.

## Setting Up Cloudinary

1. **Create a Cloudinary Account:**
   - Sign up at [Cloudinary](https://cloudinary.com/users/register/free)
   - Access your dashboard to get your cloud name

2. **Configure Upload Presets:**
   - In the Cloudinary dashboard, go to Settings > Upload
   - Create a new upload preset (set to "Unsigned" for client-side uploads)
   - Note the preset name for later use

3. **Configure Environment Variables:**
   - Copy `.env.local.sample` to `.env.local`
   - Update with your Cloudinary credentials:
     ```
     NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
     NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
     ```

## Using the File Upload Component

The app includes a `MultiFileUpload` component that handles file uploads to Cloudinary:

```tsx
import { MultiFileUpload, UploadedFile } from '@/components/ui/multi-file-upload'

// In your component:
const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])

// In your JSX:
<MultiFileUpload 
  label="Attachments" 
  value={uploadedFiles}
  onFilesChange={setUploadedFiles}
  maxFiles={5}
/>
```

## Circular Workflow

The circular feature allows administrators to create and distribute circulars with attachments:

1. **Creating Circulars:**
   - Navigate to Dashboard > Circulars > Add New
   - Fill in the circular details
   - Add attachments using the MultiFileUpload component
   - Select recipients
   - Send immediately or schedule for later

2. **Viewing Circulars:**
   - All circulars are listed in the Dashboard > Circulars section
   - Click on a circular to view details
   - Download attachments individually or all at once

## API Integration

The circular data is stored in Firebase:

1. When a circular is created, the files are first uploaded to Cloudinary
2. The circular data, including file URLs, is then stored in Firebase
3. The circular can be retrieved and displayed using the Firebase API

## Troubleshooting

- **Upload Issues:** Make sure your Cloudinary preset is set to "Unsigned" for client-side uploads
- **File Type Restrictions:** By default, the uploader accepts images, PDFs, and Office documents
