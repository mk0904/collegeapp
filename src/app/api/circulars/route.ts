import { NextResponse } from 'next/server';
import { addCircular } from '@/lib/firebase/circular';

export async function POST(request: Request) {
  try {
    // Check if the request is form data or JSON
    const contentType = request.headers.get('content-type') || '';
    
    let data: any;
    let files: any[] = [];
    
    if (contentType.includes('multipart/form-data')) {
      // Handle form data with files
      const formData = await request.formData();
      data = {
        title: formData.get('title'),
        message: formData.get('message'),
        recipients: JSON.parse(formData.get('recipients') as string || '[]'),
      };
      
      // Extract files from form data
      for (const [key, value] of formData.entries()) {
        if (key.startsWith('file-') && value instanceof File) {
          files.push({
            name: value.name,
            type: value.type,
            size: value.size,
            // In a real app, you'd upload this file to storage and get a URL
            url: URL.createObjectURL(value), // This is a temporary URL
          });
        }
      }
    } else {
      // Handle JSON data
      data = await request.json();
      files = data.files || [];
    }
    
    // Validate the input data
    if (!data.title || !data.message || !data.recipients || !data.recipients.length) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Title, message, and recipients are required' },
        { status: 400 }
      );
    }
    
    // Add the circular to the database
    const result = await addCircular({
      title: data.title,
      message: data.message,
      files: files,
      recipients: data.recipients,
      createdBy: data.createdBy || 'unknown',
    });
    
    return NextResponse.json({ 
      success: true, 
      id: result.id,
      message: 'Circular created successfully'
    });
  } catch (error) {
    console.error('Error creating circular:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create circular',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Get a list of all circulars
export async function GET(request: Request) {
  try {
    // Extract query parameters for filtering
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    // This would call a Firebase function to get circulars
    // For now, return mock data
    return NextResponse.json({
      success: true,
      circulars: [
        {
          id: 'circ-001',
          title: 'End of Year Exam Schedule',
          sentDate: '2025-08-20',
          status: 'Sent',
          recipientCount: 145,
          district: 'North District',
          school: 'All Schools'
        },
        {
          id: 'circ-002',
          title: 'Teacher Training Workshop',
          sentDate: '2025-08-15',
          status: 'Sent',
          recipientCount: 42,
          district: 'Central District',
          school: 'City High School'
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching circulars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch circulars' },
      { status: 500 }
    );
  }
}
