
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, File as FileIcon, Loader2, Calendar as CalendarIcon, MessageSquare, Send } from 'lucide-react';
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

const MAX_TOTAL_SIZE_MB = 10;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;

const FileUploader = ({ files, onFilesChange, disabled }: { files: File[], onFilesChange: (files: File[]) => void, disabled?: boolean}) => {
    const { toast } = useToast();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            const newFiles = Array.from(event.target.files);
            const allFiles = [...files, ...newFiles];

            const totalSize = allFiles.reduce((acc, file) => acc + file.size, 0);

            if (totalSize > MAX_TOTAL_SIZE_BYTES) {
                toast({
                    title: 'File size limit exceeded',
                    description: `Total file size cannot exceed ${MAX_TOTAL_SIZE_MB}MB.`,
                    variant: 'destructive',
                });
                return;
            }
            onFilesChange(allFiles);
        }
    };

    const removeFile = (index: number) => {
        onFilesChange(files.filter((_, i) => i !== index));
    };

    return (
         <div className="space-y-2">
            <div
                className={cn("relative flex flex-col items-center justify-center w-full p-4 border-2 border-dashed rounded-lg", !disabled && "cursor-pointer hover:bg-muted/50")}
                onClick={() => !disabled && fileInputRef.current?.click()}
            >
                <Upload className="w-6 h-6 text-muted-foreground" />
                <p className="mt-1 text-sm text-center text-muted-foreground">
                    Select Attachments (up to {MAX_TOTAL_SIZE_MB}MB)
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    disabled={disabled}
                />
            </div>
            {files.length > 0 && (
                <div className="mt-2 space-y-2">
                    <h4 className="font-medium text-xs text-muted-foreground">Selected Files:</h4>
                    <ul className="space-y-2">
                        {files.map((file, index) => (
                            <li key={index} className="flex items-center justify-between p-2 text-sm rounded-md bg-muted">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <FileIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                    <span className="font-medium truncate">{file.name}</span>
                                    <span className="text-muted-foreground text-xs">({(file.size / 1024).toFixed(2)} KB)</span>
                                </div>
                                {!disabled && (
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); removeFile(index);}}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export function SendNotificationModal({ isOpen, onOpenChange, selectedUsers }: SendNotificationModalProps) {
  const { toast } = useToast();
  const [isSending, setIsSending] = React.useState(false);

  // Form states
  const [generalTitle, setGeneralTitle] = React.useState('');
  const [generalMessage, setGeneralMessage] = React.useState('');
  const [generalFiles, setGeneralFiles] = React.useState<File[]>([]);
  
  const [invitationTitle, setInvitationTitle] = React.useState('');
  const [invitationMessage, setInvitationMessage] = React.useState('');
  const [venue, setVenue] = React.useState('');
  const [eventDate, setEventDate] = React.useState<Date>();
  const [eventHour, setEventHour] = React.useState('');
  const [eventMinute, setEventMinute] = React.useState('');
  const [eventPeriod, setEventPeriod] = React.useState<'AM' | 'PM'>('AM');
  const [invitationFiles, setInvitationFiles] = React.useState<File[]>([]);
  
  const [pushTitle, setPushTitle] = React.useState('');
  const [pushMessage, setPushMessage] = React.useState('');

  
  const resetForm = () => {
    setGeneralTitle('');
    setGeneralMessage('');
    setGeneralFiles([]);
    setInvitationTitle('');
    setInvitationMessage('');
    setVenue('');
    setEventDate(undefined);
    setEventHour('');
    setEventMinute('');
    setEventPeriod('AM');
    setInvitationFiles([]);
    setPushTitle('');
    setPushMessage('');
    setIsSending(false);
  };
  
  React.useEffect(() => {
    if(!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleSendNotification = async (type: 'general' | 'invitation' | 'push') => {
    if (selectedUsers.length === 0) {
      toast({ title: 'No users selected', description: 'Please select at least one user.', variant: 'destructive' });
      return;
    }

    let payload: any = {};
    let filesToUpload: File[] = [];
    let time = '';

    if (type === 'invitation' && eventHour && eventMinute) {
        const hour = parseInt(eventHour, 10);
        const minute = parseInt(eventMinute, 10);
        if (hour < 1 || hour > 12 || minute < 0 || minute > 59) {
            toast({ title: 'Invalid time format', description: 'Please enter a valid hour (1-12) and minute (0-59).', variant: 'destructive' });
            return;
        }
        time = `${eventHour.padStart(2, '0')}:${eventMinute.padStart(2, '0')} ${eventPeriod}`;
    }


    if (type === 'general') {
        if (!generalTitle) {
            toast({ title: 'Title is required', variant: 'destructive' });
            return;
        }
        payload = { type, title: generalTitle, message: generalMessage };
        filesToUpload = generalFiles;

    } else if (type === 'invitation') {
        if (!invitationTitle || !invitationMessage || !venue || !eventDate || !time) {
            toast({ title: 'All invitation fields are required', variant: 'destructive'});
            return;
        }
        payload = { type, title: invitationTitle, message: invitationMessage, venue, date: format(eventDate, "PPP"), time };
        filesToUpload = invitationFiles;

    } else if (type === 'push') {
        if (!pushTitle || !pushMessage) {
            toast({ title: 'Push title and message are required', variant: 'destructive' });
            return;
        }
        payload = { type, title: pushTitle, message: pushMessage };
    }

    setIsSending(true);
    try {
      const uploadPromises = filesToUpload.map(file => {
          const path = `notifications/${Date.now()}_${file.name}`;
          return uploadFile(file, path);
      });
      const fileUrls = await Promise.all(uploadPromises);
      
      payload.fileUrls = fileUrls;
      payload.recipients = selectedUsers.map(u => u.id);
      payload.sender = 'admin'; // Replace with actual sender ID when authentication is implemented
      
      console.log('Sending notification to:', selectedUsers.map(u => u.id));
      console.log('Notification data:', payload);
      
      // Save notification to Firestore
      try {
        const { addNotification } = await import('@/lib/firebase/firestore');
        const notificationId = await addNotification(payload);
        console.log('Notification saved with ID:', notificationId);
        
        toast({
          title: 'Notification Sent!',
          description: `Your ${type} notification has been sent to ${selectedUsers.length} user(s).`,
        });
        
        onOpenChange(false);
      } catch (error) {
        console.error('Error saving notification:', error);
        toast({
          title: 'Error',
          description: 'Failed to save the notification to the database. Please try again.',
          variant: 'destructive',
        });
      }
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

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
    if (value === '') {
        setEventHour('');
        return
    }
    let numValue = parseInt(value, 10);
    if (numValue < 1) numValue = 1;
    if (numValue > 12) numValue = 12;
    setEventHour(numValue.toString());
  }
  
  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/[^0-9]/g, '');
     if (value === '') {
        setEventMinute('');
        return
    }
    let numValue = parseInt(value, 10);
    if (numValue < 0) numValue = 0;
    if (numValue > 59) numValue = 59;
    setEventMinute(numValue.toString());
  }


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
                <TabsTrigger value="general" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <MessageSquare className="mr-2 h-4 w-4" /> General
                </TabsTrigger>
                <TabsTrigger value="invitation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <CalendarIcon className="mr-2 h-4 w-4" /> Invitation
                </TabsTrigger>
                <TabsTrigger value="push" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <Send className="mr-2 h-4 w-4" /> Push
                </TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="py-4">
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Input id="general-title" value={generalTitle} onChange={e => setGeneralTitle(e.target.value)} placeholder="Title (e.g. Important Update)" disabled={isSending} />
                    </div>
                    <div className="space-y-2">
                        <Textarea id="general-message" value={generalMessage} onChange={e => setGeneralMessage(e.target.value)} placeholder="Message" className="min-h-24" disabled={isSending}/>
                    </div>
                     <FileUploader files={generalFiles} onFilesChange={setGeneralFiles} disabled={isSending} />
                    <DialogFooter>
                        <Button onClick={() => handleSendNotification('general')} disabled={isSending}>
                            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit
                        </Button>
                    </DialogFooter>
                 </div>
            </TabsContent>
            <TabsContent value="invitation" className="py-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Input id="invitation-title" value={invitationTitle} onChange={e => setInvitationTitle(e.target.value)} placeholder="Invitation Title (e.g. Tech Fest 2024)" disabled={isSending} />
                    </div>
                    <div className="space-y-2">
                        <Textarea id="invitation-message" value={invitationMessage} onChange={e => setInvitationMessage(e.target.value)} placeholder="Message" className="min-h-24" disabled={isSending} />
                    </div>
                     <div className="space-y-2">
                        <Input id="venue" value={venue} onChange={e => setVenue(e.target.value)} placeholder="Venue (e.g. College Auditorium)" disabled={isSending} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="flex items-center gap-2">
                         <div className="flex items-center gap-1 rounded-md border border-input h-10 px-3 w-full focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                           <Input 
                            type="text"
                            maxLength={2}
                            value={eventHour}
                            onChange={handleHourChange}
                            onBlur={(e) => {
                                if (e.target.value) {
                                    setEventHour(e.target.value.padStart(2, '0'))
                                }
                            }}
                            placeholder="HH"
                            className="w-8 border-none text-center p-0 h-auto focus-visible:ring-0 focus-visible:border-none"
                           />
                           <span className="text-muted-foreground">:</span>
                           <Input
                             type="text"
                             maxLength={2}
                             value={eventMinute}
                             onChange={handleMinuteChange}
                             onBlur={(e) => {
                                if (e.target.value) {
                                    setEventMinute(e.target.value.padStart(2, '0'))
                                }
                             }}
                             placeholder="MM"
                             className="w-8 border-none text-center p-0 h-auto focus-visible:ring-0"
                           />
                         </div>
                         <Button variant="outline" className="w-[80px]" onClick={() => setEventPeriod(p => p === 'AM' ? 'PM' : 'AM')}>
                            {eventPeriod}
                         </Button>
                       </div>
                         <div className="space-y-2">
                            <Popover>
                                <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !eventDate && "text-muted-foreground"
                                    )}
                                    disabled={isSending}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {eventDate ? format(eventDate, "PPP") : <span>Event Date</span>}
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
                    <FileUploader files={invitationFiles} onFilesChange={setInvitationFiles} disabled={isSending}/>
                    <DialogFooter>
                        <Button onClick={() => handleSendNotification('invitation')} disabled={isSending}>
                            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit
                        </Button>
                    </DialogFooter>
                </div>
            </TabsContent>
            <TabsContent value="push" className="py-4">
                 <div className="space-y-4">
                    <div className="space-y-2">
                        <Input id="push-title" value={pushTitle} onChange={e => setPushTitle(e.target.value)} placeholder="Push Title (short and catchy)" disabled={isSending} />
                    </div>
                    <div className="space-y-2">
                        <Textarea id="push-message" value={pushMessage} onChange={e => setPushMessage(e.target.value)} placeholder="Push Message (concise, max 150 chars)." maxLength={150} className="min-h-24" disabled={isSending}/>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => handleSendNotification('push')} disabled={isSending}>
                            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit
                        </Button>
                    </DialogFooter>
                 </div>
            </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

    
