'use client';

import React from 'react';
import { 
  File, 
  Image as ImageIcon, 
  FileText, 
  FileIcon,
  FileSpreadsheet,
  FileJson
} from 'lucide-react';
import { 
  Card,
  CardContent,
} from '@/components/ui/card';
import { UploadedFile } from '@/components/ui/multi-file-upload';

interface FilePreviewProps {
  file: UploadedFile;
}

export function FilePreview({ file }: FilePreviewProps) {
  const isImage = file.type.includes('image');
  
  const getFileIcon = () => {
    if (file.url.endsWith('.pdf')) {
      return <FileText className="h-10 w-10 text-red-500" />;
    } else if (file.url.endsWith('.xlsx') || file.url.endsWith('.xls')) {
      return <FileSpreadsheet className="h-10 w-10 text-green-500" />;
    } else if (file.url.endsWith('.doc') || file.url.endsWith('.docx')) {
      return <FileText className="h-10 w-10 text-blue-500" />;
    } else if (file.url.endsWith('.json') || file.url.endsWith('.txt')) {
      return <FileJson className="h-10 w-10 text-yellow-500" />;
    } else {
      return <FileIcon className="h-10 w-10 text-gray-500" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {isImage ? (
          <div className="aspect-video relative bg-muted">
            <img 
              src={file.url} 
              alt={file.name}
              className="w-full h-full object-cover" 
            />
          </div>
        ) : (
          <div className="aspect-video flex items-center justify-center bg-muted/50">
            {getFileIcon()}
          </div>
        )}
        <div className="p-3">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{file.type}</p>
        </div>
      </CardContent>
    </Card>
  );
}
