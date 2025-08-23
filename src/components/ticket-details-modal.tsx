
'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from './ui/badge';
import type { Ticket } from '@/lib/mock-data';

interface TicketDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  ticket: Ticket;
}

export function TicketDetailsModal({ isOpen, onOpenChange, ticket }: TicketDetailsModalProps) {
  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <div>
                 <DialogTitle className="font-headline text-2xl mb-1">{ticket.subject}</DialogTitle>
                 <DialogDescription>
                    Query ID: {ticket.id}
                </DialogDescription>
            </div>
            <Badge variant={ticket.status === 'Resolved' ? 'default' : ticket.status === 'Open' ? 'destructive' : 'secondary'}>
                {ticket.status}
            </Badge>
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-sm font-semibold text-right text-muted-foreground col-span-1">User</p>
                <p className="text-sm col-span-3">{ticket.userName} ({ticket.userEmail})</p>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-sm font-semibold text-right text-muted-foreground col-span-1">Issue Type</p>
                <p className="text-sm col-span-3">{ticket.issueType}</p>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-sm font-semibold text-right text-muted-foreground col-span-1">Date Raised</p>
                <p className="text-sm col-span-3">{ticket.dateRaised}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <p className="text-sm font-semibold text-right text-muted-foreground col-span-1">Date Closed</p>
                <p className="text-sm col-span-3">{ticket.dateClosed || 'Not resolved yet'}</p>
            </div>
             <div className="grid grid-cols-4 items-start gap-4">
                <p className="text-sm font-semibold text-right text-muted-foreground col-span-1 pt-1">Description</p>
                <div className="col-span-3 bg-secondary/50 p-3 rounded-md border text-sm">
                    <p>{ticket.description}</p>
                </div>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
