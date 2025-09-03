'use client';

/**
 * Utility function to upload files to Cloudinary directly from the browser
 */
export async function uploadToCloudinary(
  file: File, 
  options: { 
    folder?: string;
    resourceType?: string;
    preset?: 'circulars' | 'projects' | 'submissions';
  } = {}
): Promise<{
  public_id: string;
  secure_url: string;
  format: string;
  resource_type: string;
}> {
  // Create FormData
  const formData = new FormData();
  formData.append('file', file);
  
  // Determine which upload preset to use
  let uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '';
  
  // Use specific presets if available
  if (options.preset === 'circulars') {
    uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_CIRCULAR_PRESET || uploadPreset;
  }
  
  formData.append('upload_preset', uploadPreset);
  
  // Add folder if specified, otherwise use default
  const folder = options.folder || 'college-app/uploads';
  formData.append('folder', folder);
  
  // Upload to Cloudinary
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`;
  
  try {
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Upload failed');
    }
    
    const data = await response.json();
    
    return {
      public_id: data.public_id,
      secure_url: data.secure_url,
      format: data.format,
      resource_type: data.resource_type,
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
}
