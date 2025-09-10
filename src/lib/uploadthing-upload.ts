'use client';

/**
 * UploadThing integration for file uploads
 * This is a reliable alternative to Cloudinary and Firebase Storage
 */

export interface UploadThingFile {
  name: string;
  url: string;
  size: number;
  type: string;
  key: string;
}

/**
 * Upload a single file to UploadThing
 */
export async function uploadFileToUploadThing(
  file: File,
  options: {
    endpoint?: string;
  } = {}
): Promise<UploadThingFile> {
  const formData = new FormData();
  formData.append('file', file);
  
  // You would replace this with your actual UploadThing endpoint
  const endpoint = options.endpoint || '/api/uploadthing';
  
  try {
    console.log(`Uploading ${file.name} to UploadThing...`);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error(`UploadThing upload failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`Successfully uploaded ${file.name}:`, {
      url: data.url,
      key: data.key,
      size: file.size
    });
    
    return {
      name: file.name,
      url: data.url,
      size: file.size,
      type: file.type,
      key: data.key,
    };
  } catch (error) {
    console.error('UploadThing upload error:', error);
    throw error;
  }
}

/**
 * Upload multiple files to UploadThing
 */
export async function uploadMultipleFilesToUploadThing(
  files: File[],
  options: {
    endpoint?: string;
  } = {}
): Promise<UploadThingFile[]> {
  console.log(`Starting upload of ${files.length} files to UploadThing...`);
  
  const uploadPromises = files.map(async (file, index) => {
    try {
      const result = await uploadFileToUploadThing(file, options);
      console.log(`✅ Uploaded ${index + 1}/${files.length}: ${file.name}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to upload ${file.name}:`, error);
      throw new Error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });
  
  const results = await Promise.all(uploadPromises);
  console.log(`🎉 All ${files.length} files uploaded successfully to UploadThing!`);
  
  return results;
}

/**
 * Test if an UploadThing URL is accessible
 */
export async function testUploadThingUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('UploadThing URL test failed:', error);
    return false;
  }
}

