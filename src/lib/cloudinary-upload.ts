'use client';

/**
 * Utility function to upload files to Cloudinary directly from the browser
 */
export async function uploadToCloudinary(
  file: File,
  options: {
    folder?: string;
    resourceType?: 'image' | 'video' | 'raw' | 'auto';
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
  
  // Force public access mode (must also be allowed by preset)
  formData.append('access_mode', 'public');
  
  // Pick resource type: default to auto; use raw for non-image/video like PDFs
  const inferredResourceType: 'image' | 'video' | 'raw' =
    file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'raw';
  const resourceType = options.resourceType || inferredResourceType;
  
  // Guardrails: ensure env vars exist
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error('Missing NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME');
  }
  if (!uploadPreset) {
    throw new Error('Missing NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
  }
  
  // Upload to Cloudinary
  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
  
  try {
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData,
    });
    
    const data = await response.json().catch(async () => {
      // Fallback to text if JSON parse fails
      const text = await response.text();
      return { error: { message: text || 'Unknown error' } } as any;
    });

    if (!response.ok || (data && data.error)) {
      const reason = data?.error?.message || `${response.status} ${response.statusText}`;
      throw new Error(`Cloudinary upload failed: ${reason}`);
    }
    
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
