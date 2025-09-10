'use client';

import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react";
import { generateReactHelpers } from "@uploadthing/react";
import type { OurFileRouter } from "@/app/api/uploadthing/route";

export const UploadButton = generateUploadButton<OurFileRouter>();
export const UploadDropzone = generateUploadDropzone<OurFileRouter>();

export const { useUploadThing, uploadFiles } = generateReactHelpers<OurFileRouter>();

/**
 * Upload multiple files to UploadThing using the proper client
 */
export async function uploadMultipleFilesToUploadThing(
  files: File[]
): Promise<Array<{
  name: string;
  url: string;
  size: number;
  type: string;
  key: string;
}>> {
  console.log(`Starting upload of ${files.length} files to UploadThing...`);
  
  try {
    // Use UploadThing's uploadFiles function
    const response = await uploadFiles("circularUploader", { files });
    
    // Convert UploadThing response to our format
    const results = response.map((file: any, index: number) => ({
      name: files[index].name,
      url: file.url,
      size: files[index].size,
      type: files[index].type,
      key: file.key,
    }));
    
    console.log(`🎉 All ${files.length} files uploaded successfully to UploadThing!`);
    return results;
    
  } catch (error) {
    console.error('UploadThing upload error:', error);
    throw new Error(`Failed to upload files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
