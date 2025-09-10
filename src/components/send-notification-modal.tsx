
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Upload, X, File as FileIcon, Loader2, Calendar as CalendarIcon, MessageSquare, Send } from 'lucide-react';
import { uploadMultipleFilesToUploadThing } from '@/lib/uploadthing-client';
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
  senderId?: string;
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

export function SendNotificationModal({ isOpen, onOpenChange, selectedUsers, senderId = 'admin' }: SendNotificationModalProps) {
  const { toast } = useToast();
  const [isSending, setIsSending] = React.useState(false);
  const [currentTab, setCurrentTab] = React.useState('push');

  // Form states
  // Push states
  const [pushTitle, setPushTitle] = React.useState('');
  const [pushMessage, setPushMessage] = React.useState('');
  const [pushFiles, setPushFiles] = React.useState<File[]>([]);
  
  const [invitationTitle, setInvitationTitle] = React.useState('');
  const [invitationMessage, setInvitationMessage] = React.useState('');
  const [venue, setVenue] = React.useState('');
  const [eventDate, setEventDate] = React.useState<Date>();
  const [eventHour, setEventHour] = React.useState('');
  const [eventMinute, setEventMinute] = React.useState('');
  const [eventPeriod, setEventPeriod] = React.useState<'AM' | 'PM'>('AM');
  const [invitationFiles, setInvitationFiles] = React.useState<File[]>([]);


  
  const resetForm = () => {
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
    setPushFiles([]);
    setIsSending(false);
  };
  
  React.useEffect(() => {
    if(!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleSendNotification = async (type: 'invitation' | 'push') => {
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

    if (type === 'invitation') {
        if (!invitationTitle || !invitationMessage || !venue || !eventDate || !eventHour || !eventMinute) {
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
        filesToUpload = pushFiles;
    }

    setIsSending(true);
    try {
      let fileUrls: string[] = [];
      let attachments: { public_id: string; secure_url: string; format: string; resource_type: string }[] = [];
      if (filesToUpload.length > 0) {
        const uploaded = await uploadMultipleFilesToUploadThing(filesToUpload);
        attachments = uploaded.map((u) => ({
          public_id: u.key,
          secure_url: u.url,
          format: (u.type?.split('/')?.[1] || 'raw'),
          resource_type: u.type?.startsWith('image/') ? 'image' : (u.type?.startsWith('video/') ? 'video' : 'raw'),
        }));
        fileUrls = attachments.map(a => a.secure_url);
      }
      
      payload.fileUrls = fileUrls;
      payload.attachments = attachments;
      payload.recipients = selectedUsers.map(u => u.id);
      payload.sender = senderId;
      
      console.log('Sending notification to:', selectedUsers.map(u => u.id));
      console.log('Notification data:', payload);
      
      // Save notification to Firestore
      try {
        const { addNotification } = await import('@/lib/firebase/firestore');
        console.log('Attempting to save notification with payload:', payload);
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
          description: `Failed to save the notification to the database: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Error',
        description: `Failed to send the notification: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      <DialogContent className="max-w-6xl h-[95vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Send className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold">Send Notification</DialogTitle>
              <DialogDescription>
                Send announcements and updates to your organization members.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <Tabs defaultValue="push" value={currentTab} onValueChange={setCurrentTab} className="flex flex-col flex-1 min-h-0 overflow-hidden">
          <div className="px-6 py-4 border-b flex items-center justify-center">
            <TabsList className="inline-flex bg-accent rounded-lg p-1">
              <TabsTrigger value="push" className="px-4 py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Send className="mr-2 h-4 w-4" /> Push Notification
              </TabsTrigger>
              <TabsTrigger value="invitation" className="px-4 py-2 rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <CalendarIcon className="mr-2 h-4 w-4" /> Event Invitation
              </TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="invitation" className="flex-1 min-h-0 overflow-y-auto data-[state=active]:flex data-[state=inactive]:hidden">
            {/* Left Column - Invitation Details */}
            <div className="w-1/2 p-6 border-r space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Title *</label>
                <Input 
                  id="invitation-title" 
                  value={invitationTitle} 
                  onChange={e => setInvitationTitle(e.target.value)} 
                  placeholder="Enter event title (e.g. Tech Fest 2024)" 
                  disabled={isSending} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Message *</label>
                <Textarea 
                  id="invitation-message" 
                  value={invitationMessage} 
                  onChange={e => setInvitationMessage(e.target.value)} 
                  placeholder="Enter event details and description" 
                  className="min-h-24 resize-none" 
                  disabled={isSending} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Venue *</label>
                <Input 
                  id="venue" 
                  value={venue} 
                  onChange={e => setVenue(e.target.value)} 
                  placeholder="Enter venue (e.g. College Auditorium)" 
                  disabled={isSending} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Date & Time *</label>
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
                        disabled={isSending}
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
                        disabled={isSending}
                      />
                    </div>
                    <Button variant="outline" className="w-[80px]" onClick={() => setEventPeriod(p => p === 'AM' ? 'PM' : 'AM')} disabled={isSending}>
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
                          {eventDate ? format(eventDate, "PPP") : <span>Select Date</span>}
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
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Attachments</label>
                <FileUploader files={invitationFiles} onFilesChange={setInvitationFiles} disabled={isSending}/>
              </div>
            </div>
            
            {/* Right Column - Recipients */}
            <div className="w-1/2 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">Recipients</h3>
                </div>
                <div className="px-3 py-1 bg-accent rounded-full">
                  <span className="text-sm font-medium text-muted-foreground">
                    {selectedUsers.length} selected
                  </span>
                </div>
              </div>
              
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                <div className="p-3 border-b bg-accent">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">Selected Recipients</span>
                  </div>
                </div>
                <div className="divide-y">
                  {selectedUsers.map(user => (
                    <div key={user.id} className="p-3 flex items-center space-x-3 hover:bg-accent transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{user.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center space-x-1">
                          <span>{user.role}</span>
                          <span>•</span>
                          <span>{user.district}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {user.college}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="push" className="flex-1 min-h-0 overflow-y-auto data-[state=active]:flex data-[state=inactive]:hidden">
            {/* Left Column - Push Details */}
            <div className="w-1/2 p-6 border-r space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Notification Title *</label>
                <Input 
                  id="push-title" 
                  value={pushTitle} 
                  onChange={e => setPushTitle(e.target.value)} 
                  placeholder="Enter notification title (short and catchy)" 
                  disabled={isSending} 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Notification Message *</label>
                <Textarea 
                  id="push-message" 
                  value={pushMessage} 
                  onChange={e => setPushMessage(e.target.value)} 
                  placeholder="Enter notification message (concise, max 150 chars)" 
                  maxLength={150} 
                  className="min-h-24 resize-none w-full" 
                  disabled={isSending}
                  rows={4}
                />
                <div className="text-xs text-muted-foreground text-right">
                  {pushMessage.length}/150 characters
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Attachments</label>
                <FileUploader files={pushFiles} onFilesChange={setPushFiles} disabled={isSending} />
              </div>
            </div>
            
            {/* Right Column - Recipients */}
            <div className="w-1/2 p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-4 w-4 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">Recipients</h3>
                </div>
                <div className="px-3 py-1 bg-accent rounded-full">
                  <span className="text-sm font-medium text-muted-foreground">
                    {selectedUsers.length} selected
                  </span>
                </div>
              </div>
              
              <div className="border rounded-lg max-h-64 overflow-y-auto">
                <div className="p-3 border-b bg-accent">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium">Selected Recipients</span>
                  </div>
                </div>
                <div className="divide-y">
                  {selectedUsers.map(user => (
                    <div key={user.id} className="p-3 flex items-center space-x-3 hover:bg-accent transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{user.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center space-x-1">
                          <span>{user.role}</span>
                          <span>•</span>
                          <span>{user.district}</span>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {user.college}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-accent flex-shrink-0">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                Ready to send to {selectedUsers.length} recipient{selectedUsers.length !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button 
                onClick={() => handleSendNotification(currentTab as 'push' | 'invitation')} 
                disabled={isSending}
              >
                {isSending ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Sending...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Send className="h-4 w-4" />
                    <span>Send {currentTab === 'push' ? 'Notification' : 'Invitation'}</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
