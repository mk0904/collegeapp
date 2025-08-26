'use client';

import React, { useState } from 'react';
import { X, Upload, File, Image, FileIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CloudinaryResult, CloudinaryUploadWidget } from '@/lib/cloudinary';

export type UploadedFile = {
  id: string;
  url: string;
  name: string;
  type: string;
};

interface MultiFileUploadProps {
  label?: string;
  onFilesChange: (files: UploadedFile[]) => void;
  value: UploadedFile[];
  maxFiles?: number;
}

export function MultiFileUpload({
  label = 'Upload Files',
  onFilesChange,
  value = [],
  maxFiles = 5,
}: MultiFileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(value);

  const handleUpload = (result: CloudinaryResult) => {
    if (uploadedFiles.length >= maxFiles) {
      return;
    }
    
    const { public_id, secure_url, resource_type } = result.info;
    
    // Extract file name from the public_id (last part after the last slash)
    const name = public_id.split('/').pop() || 'file';
    
    const newFile: UploadedFile = {
      id: public_id,
      url: secure_url,
      name,
      type: resource_type,
    };
    
    const updatedFiles = [...uploadedFiles, newFile];
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const removeFile = (id: string) => {
    const updatedFiles = uploadedFiles.filter((file) => file.id !== id);
    setUploadedFiles(updatedFiles);
    onFilesChange(updatedFiles);
  };

  const getFileIcon = (type: string) => {
    if (type.includes('image')) {
      return <Image className="h-4 w-4" />;
    }
    return <FileIcon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="space-y-4">
        {uploadedFiles.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {uploadedFiles.map((file) => (
              <div 
                key={file.id}
                className="flex items-center gap-2 p-2 border rounded-md group hover:bg-muted/50 transition-colors"
              >
                {getFileIcon(file.type)}
                <div className="flex-1 truncate">
                  <div className="text-sm font-medium truncate">{file.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {file.type}
                  </div>
                </div>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6 opacity-60 group-hover:opacity-100"
                  onClick={() => removeFile(file.id)}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            ))}
          </div>
        )}

        {uploadedFiles.length < maxFiles && (
          <CloudinaryUploadWidget onUpload={handleUpload}>
            {({ open }) => (
              <Button
                type="button"
                variant="outline"
                className="w-full border-dashed py-8 flex flex-col items-center justify-center gap-1 h-auto"
                onClick={() => open()}
              >
                <Upload className="h-8 w-8 mb-2" />
                <div className="font-medium">Upload Files</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Drag & drop or click to browse
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  {uploadedFiles.length} / {maxFiles} files
                </div>
                <div className="text-xs text-muted-foreground">
                  Supports images, PDFs, Word docs, Excel files
                </div>
              </Button>
            )}
          </CloudinaryUploadWidget>
        )}
      </div>
    </div>
  );
}
