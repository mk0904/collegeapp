
'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from './ui/badge';
import type { Ticket } from '@/lib/mock-data';
import { Separator } from './ui/separator';

interface TicketDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  ticket: Ticket;
}

export function TicketDetailsModal({ isOpen, onOpenChange, ticket }: TicketDetailsModalProps) {
  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
                 <DialogTitle className="font-headline text-2xl mb-1">{ticket.subject}</DialogTitle>
                 <DialogDescription>
                    Query ID: {ticket.id}
                </DialogDescription>
            </div>
            <Badge variant={ticket.status === 'Resolved' ? 'default' : 'destructive'}>
                {ticket.status}
            </Badge>
          </div>
        </DialogHeader>
        <Separator />
        <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">User</p>
                    <p className="text-sm font-semibold">{ticket.userName} ({ticket.userEmail})</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Issue Type</p>
                    <p className="text-sm font-semibold">{ticket.issueType}</p>
                </div>
                 <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Date Raised</p>
                    <p className="text-sm font-semibold">{ticket.dateRaised}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Date Closed</p>
                    <p className="text-sm font-semibold">{ticket.dateClosed || 'Not resolved yet'}</p>
                </div>
            </div>
            
            <Separator />

             <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Description</p>
                <div className="bg-secondary/50 p-4 rounded-md border text-sm">
                    <p>{ticket.description}</p>
                </div>
            </div>

            {ticket.image && (
                 <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">Attachment</p>
                    <div className="border rounded-md overflow-hidden">
                        <Image src={ticket.image} alt="Ticket Attachment" width={800} height={600} className="w-full h-auto object-cover" data-ai-hint="error screenshot"/>
                    </div>
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
