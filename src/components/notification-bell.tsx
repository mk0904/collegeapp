'use client';

import * as React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from '@/components/ui/popover';
import { getNotifications, markNotificationAsRead, updateInvitationResponse } from '@/lib/firebase/firestore';
import type { Notification } from '@/lib/mock-data';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
  userId: string;
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  
  // Calculate unread notifications
  const unreadCount = notifications.filter(
    notification => !notification.readBy.includes(userId)
  ).length;
  
  // Fetch notifications
  const fetchNotifications = React.useCallback(async () => {
    setLoading(true);
    try {
      const notifs = await getNotifications(userId);
      setNotifications(notifs);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);
  
  React.useEffect(() => {
    fetchNotifications();
    
    // Set up a refresh interval (every 1 minute)
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);
  
  // Handle invitation response
  const handleInvitationResponse = async (notificationId: string, status: 'accepted' | 'declined' | 'maybe') => {
    try {
      await updateInvitationResponse(notificationId, userId, status);
      // Update local state
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { 
                ...n, 
                responses: {
                  ...n.responses,
                  [userId]: { status, respondedAt: new Date().toISOString() }
                }
              } 
            : n
        )
      );
    } catch (error) {
      console.error('Error updating invitation response:', error);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="px-4 py-3 font-semibold text-sm border-b">
          Notifications
        </div>
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No notifications yet
            </div>
          ) : (
            notifications
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map(notification => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 border-b cursor-pointer hover:bg-muted/50",
                    !notification.readBy.includes(userId) && "bg-muted/20"
                  )}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm">
                      {notification.title}
                    </h4>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notification.message.length > 100 
                      ? `${notification.message.slice(0, 100)}...` 
                      : notification.message}
                  </p>
                  {notification.type === 'invitation' && (
                    <div className="mt-2 space-y-2">
                      <div className="text-xs font-medium">
                        <div className="flex gap-2">
                          <span>Venue: {notification.venue}</span>
                          <span>Date: {notification.date}</span>
                          <span>Time: {notification.time}</span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        {notification.responses?.[userId]?.status === 'pending' ? (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInvitationResponse(notification.id, 'accepted');
                              }}
                            >
                              ✓ Accept
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInvitationResponse(notification.id, 'maybe');
                              }}
                            >
                              ? Maybe
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-6 px-2 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleInvitationResponse(notification.id, 'declined');
                              }}
                            >
                              ✗ Decline
                            </Button>
                          </>
                        ) : (
                          <div className="text-xs font-medium">
                            Status: <span className={cn(
                              "capitalize",
                              notification.responses?.[userId]?.status === 'accepted' && "text-green-600",
                              notification.responses?.[userId]?.status === 'declined' && "text-red-600",
                              notification.responses?.[userId]?.status === 'maybe' && "text-yellow-600"
                            )}>
                              {notification.responses?.[userId]?.status}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
