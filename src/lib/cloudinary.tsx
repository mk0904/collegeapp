'use client';

import { CldUploadWidget } from 'next-cloudinary';

// Define the result type for Cloudinary upload
export type CloudinaryResult = {
  info: {
    public_id: string;
    secure_url: string;
    resource_type: string;
  }
};

// Cloudinary widget configuration
export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  apiUrl: process.env.NEXT_PUBLIC_CLOUDINARY_API_URL || 'https://api.cloudinary.com/v1_1',
  folder: 'college-app/circulars',
};

/**
 * A component that renders a Cloudinary upload widget
 */
export function CloudinaryUploadWidget({
  onUpload,
  children,
  options = {},
}: {
  onUpload: (result: CloudinaryResult) => void;
  children: ({ open }: { open: () => void }) => React.ReactElement;
  options?: Record<string, any>;
}) {
  return (
    <CldUploadWidget
      uploadPreset={cloudinaryConfig.uploadPreset}
      options={{
        maxFiles: 10,
        resourceType: 'auto',
        folder: cloudinaryConfig.folder,
        clientAllowedFormats: ['image', 'pdf', 'doc', 'docx', 'xlsx', 'xls', 'ppt', 'pptx'],
        ...options,
      }}
      onSuccess={(result, { widget }) => {
        onUpload(result as CloudinaryResult);
        widget.close();
      }}
    >
      {({ open }) => children({ open })}
    </CldUploadWidget>
  );
}
