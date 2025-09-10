// UploadThing integration for file uploads
// This is an alternative to Cloudinary that's more reliable

export interface UploadThingFile {
  name: string;
  url: string;
  size: number;
  type: string;
}

// Simple UploadThing implementation
export async function uploadToUploadThing(
  file: File,
  options: {
    endpoint?: string;
    onUploadProgress?: (progress: number) => void;
  } = {}
): Promise<UploadThingFile> {
  const formData = new FormData();
  formData.append('file', file);
  
  // You would replace this with your actual UploadThing endpoint
  const endpoint = options.endpoint || '/api/uploadthing';
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`UploadThing upload failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      name: file.name,
      url: data.url,
      size: file.size,
      type: file.type,
    };
  } catch (error) {
    console.error('UploadThing upload error:', error);
    throw error;
  }
}

// Multiple file upload with UploadThing
export async function uploadMultipleToUploadThing(
  files: File[],
  options: {
    endpoint?: string;
    onUploadProgress?: (fileIndex: number, progress: number) => void;
  } = {}
): Promise<UploadThingFile[]> {
  const uploadPromises = files.map(async (file, index) => {
    try {
      const result = await uploadToUploadThing(file, {
        ...options,
        onUploadProgress: options.onUploadProgress 
          ? (progress) => options.onUploadProgress!(index, progress)
          : undefined,
      });
      return result;
    } catch (error) {
      console.error(`Failed to upload file ${file.name}:`, error);
      throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  return Promise.all(uploadPromises);
}
