'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, File as FileIcon, Loader2 } from 'lucide-react';
import { uploadFile } from '@/lib/firebase/storage';

interface SendCircularModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function SendCircularModal({ isOpen, onOpenChange }: SendCircularModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [files, setFiles] = React.useState<File[]>([]);
  const [isSending, setIsSending] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      setFiles((prevFiles) => [...prevFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setFiles([]);
    setIsSending(false);
  };

  const handleSendCircular = async () => {
    if (!title) {
      toast({
        title: 'Title is required',
        description: 'Please provide a title for the circular.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      // In a real application, you would first upload the files to a storage service
      // like Firebase Storage, get their URLs, and then save the circular data
      // (title, description, file URLs) to Firestore. Then, you'd trigger the
      // push notification.

      const fileUrls = await Promise.all(
        files.map(async (file) => {
          const downloadURL = await uploadFile(file, `circulars/${Date.now()}_${file.name}`);
          return downloadURL;
        })
      );
      
      // Placeholder for sending notification logic
      console.log('Sending circular with:', { title, description, fileUrls });

      toast({
        title: 'Circular Sent!',
        description: 'Your circular has been scheduled for delivery.',
      });
      
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending circular:', error);
      toast({
        title: 'Error',
        description: 'Failed to send the circular. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Send New Circular</DialogTitle>
          <DialogDescription>
            Compose and send a circular to all users. It will be sent as a push notification.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title" className="font-semibold">
              Circular Title
            </Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Holiday Announcement" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description" className="font-semibold">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide more details about the circular..."
              className="min-h-[100px]"
            />
          </div>
          <div className="grid gap-2">
            <Label className="font-semibold">Attachments</Label>
            <div
                className="relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload className="w-8 h-8 text-primary/60" />
                <p className="mt-2 text-sm text-center text-muted-foreground">
                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PDF, PNG, JPG, etc.</p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                />
            </div>
             {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-sm">Selected Files:</h4>
                    <ul className="space-y-2">
                        {files.map((file, index) => (
                            <li key={index} className="flex items-center justify-between p-2 rounded-md bg-secondary">
                                <div className="flex items-center gap-2">
                                    <FileIcon className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-sm font-medium truncate max-w-xs">{file.name}</span>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeFile(index)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSendCircular} disabled={isSending}>
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSending ? 'Sending...' : 'Send Circular'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
