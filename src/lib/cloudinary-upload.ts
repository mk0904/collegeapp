'use client';

/**
 * Simple Cloudinary upload function - basic working version
 */
export async function uploadToCloudinary(
  file: File,
  options: {
    folder?: string;
  } = {}
): Promise<{
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
}> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '');
  formData.append('folder', options.folder || 'college-app/uploads');
  
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  
  // Determine the correct upload endpoint based on file type
  const isImage = file.type.startsWith('image/');
  const uploadEndpoint = isImage ? 'image' : 'raw';
  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${uploadEndpoint}/upload`;
  
  console.log(`Uploading ${file.name} (${file.type}) to ${uploadEndpoint} endpoint`);
  
  try {
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${data.error?.message || response.statusText}`);
    }
    
    console.log(`Successfully uploaded ${file.name}:`, {
      public_id: data.public_id,
      secure_url: data.secure_url,
      format: data.format,
      resource_type: data.resource_type
    });
    
    return {
      public_id: data.public_id,
      secure_url: data.secure_url,
      format: data.format,
      resource_type: data.resource_type,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple files to Cloudinary - simple version
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  options: {
    folder?: string;
  } = {}
): Promise<Array<{
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
  name: string;
  size: number;
  type: string;
}>> {
  const uploadPromises = files.map(async (file) => {
    try {
      const result = await uploadToCloudinary(file, options);
      return {
        ...result,
        name: file.name,
        size: file.size,
        type: file.type,
      };
    } catch (error) {
      console.error(`Failed to upload file ${file.name}:`, error);
      throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  return Promise.all(uploadPromises);
}

/**
 * Test if a Cloudinary URL is accessible
 */
export async function testCloudinaryUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('URL test failed:', error);
    return false;
  }
}
