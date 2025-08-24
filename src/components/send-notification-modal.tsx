
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
import { Upload, X, File as FileIcon, Loader2, Users, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { uploadFile } from '@/lib/firebase/storage';
import type { User } from '@/lib/mock-data';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar } from './ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface SendNotificationModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  selectedUsers: User[];
}

export function SendNotificationModal({ isOpen, onOpenChange, selectedUsers }: SendNotificationModalProps) {
  const { toast } = useToast();
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [files, setFiles] = React.useState<File[]>([]);
  const [isSending, setIsSending] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [eventDate, setEventDate] = React.useState<Date>();

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
    setEventDate(undefined);
  };
  
  React.useEffect(() => {
    if(!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleSendNotification = async () => {
    if (!title) {
      toast({
        title: 'Title is required',
        description: 'Please provide a title for the notification.',
        variant: 'destructive',
      });
      return;
    }
    
    if (selectedUsers.length === 0) {
      toast({
        title: 'No users selected',
        description: 'Please select at least one user to send the notification to.',
        variant: 'destructive',
      });
      return;
    }

    setIsSending(true);
    try {
      const fileUrls = await Promise.all(
        files.map(async (file) => {
          const downloadURL = await uploadFile(file, `notifications/${Date.now()}_${file.name}`);
          return downloadURL;
        })
      );
      
      // Placeholder for sending notification logic
      console.log('Sending notification to:', selectedUsers.map(u => u.id));
      console.log('Notification data:', { title, description, fileUrls });

      toast({
        title: 'Notification Sent!',
        description: `Your notification has been sent to ${selectedUsers.length} user(s).`,
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: 'Failed to send the notification. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="font-headline text-2xl">Send Notification</DialogTitle>
            <Badge variant="outline" className="flex items-center gap-2">
                <div className="bg-primary rounded-full w-2 h-2"></div>
                {selectedUsers.length} Selected
            </Badge>
          </div>
        </DialogHeader>
        <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/60">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="invitation">Invitation</TabsTrigger>
                <TabsTrigger value="push">Push</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="py-4">
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="general-title">Title</Label>
                        <Input id="general-title" placeholder="e.g. Important Update" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="general-message">Message</Label>
                        <Textarea id="general-message" placeholder="Type your general notification message here." className="min-h-24"/>
                    </div>
                     <div className="space-y-2">
                        <Label>Attachment</Label>
                        <div
                            className="relative flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-6 h-6 text-muted-foreground" />
                            <p className="mt-1 text-sm text-center text-muted-foreground">
                                Select File (Only Image/PDF allowed)
                            </p>
                            <input ref={fileInputRef} type="file" className="hidden" />
                        </div>
                    </div>
                 </div>
            </TabsContent>
            <TabsContent value="invitation" className="py-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="invitation-message">Heading / Message</Label>
                        <Textarea id="invitation-message" placeholder="e.g. You are invited to the Annual Day celebration." className="min-h-24" />
                        <p className="text-sm text-destructive">Must be at least 15 characters</p>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="venue">Venue</Label>
                        <Input id="venue" placeholder="e.g. College Auditorium" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label htmlFor="event-time">Event Time</Label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input id="event-time" placeholder="e.g. 10:00 AM" className="pl-10" />
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="event-date">Event Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !eventDate && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {eventDate ? format(eventDate, "PPP") : <span>Pick a date</span>}
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                <Calendar
                                    mode="single"
                                    selected={eventDate}
                                    onSelect={setEventDate}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label>Attachment</Label>
                        <div
                            className="relative flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Upload className="w-6 h-6 text-muted-foreground" />
                            <p className="mt-1 text-sm text-center text-muted-foreground">
                                Select File (Only Image/PDF allowed)
                            </p>
                            <input ref={fileInputRef} type="file" className="hidden" />
                        </div>
                    </div>
                </div>
            </TabsContent>
            <TabsContent value="push" className="py-4">
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="push-title">Push Title</Label>
                        <Input id="push-title" placeholder="Short and catchy title" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="push-message">Push Message</Label>
                        <Textarea id="push-message" placeholder="Concise message for push notification (max 150 chars)." maxLength={150} className="min-h-24"/>
                    </div>
                 </div>
            </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          <Button onClick={handleSendNotification} disabled={isSending}>
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSending ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
