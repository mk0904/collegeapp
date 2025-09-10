// Test UploadThing implementation
import { uploadMultipleFilesToUploadThing } from '@/lib/uploadthing-client';

// Test function to verify UploadThing is working
export async function testUploadThing() {
  console.log('Testing UploadThing implementation...');
  
  // Create a test file
  const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
  
  try {
    const results = await uploadMultipleFilesToUploadThing([testFile]);
    console.log('✅ UploadThing test successful:', results);
    return true;
  } catch (error) {
    console.error('❌ UploadThing test failed:', error);
    return false;
  }
}

