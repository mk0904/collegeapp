'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, File, Image, FileIcon } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { uploadMultipleFiles, type FirebaseStorageFile } from '@/lib/firebase/storage';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(value);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    if (uploadedFiles.length + selectedFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} files.`,
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const filesArray = Array.from(selectedFiles);
      const uploadResults = await uploadMultipleFiles(filesArray, 'uploads', 'general');
      
      const newFiles: UploadedFile[] = uploadResults.map((result) => ({
        id: result.path,
        url: result.url,
        name: result.name,
        type: result.type,
      }));

      const updatedFiles = [...uploadedFiles, ...newFiles];
      setUploadedFiles(updatedFiles);
      onFilesChange(updatedFiles);

      toast({
        title: "Files uploaded",
        description: `Successfully uploaded ${filesArray.length} file(s).`,
      });
    } catch (error) {
      console.error('File upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Failed to upload files.',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
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
          <div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full border-dashed py-8 flex flex-col items-center justify-center gap-1 h-auto"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                  <div className="font-medium">Uploading...</div>
                </>
              ) : (
                <>
                  <Upload className="h-8 w-8 mb-2" />
                  <div className="font-medium">Upload Files</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Click to browse files
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {uploadedFiles.length} / {maxFiles} files
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Supports images, PDFs, Word docs, Excel files
                  </div>
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
