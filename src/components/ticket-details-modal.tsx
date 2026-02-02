
'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Badge } from './ui/badge';
import type { Ticket } from '@/lib/mock-data';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LifeBuoy, User, Mail, Calendar, FileText, Image as ImageIcon, CheckCircle, Clock } from 'lucide-react';

interface TicketDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  ticket: Ticket;
}

export function TicketDetailsModal({ isOpen, onOpenChange, ticket }: TicketDetailsModalProps) {
  if (!ticket) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden rounded-2xl border-0 shadow-2xl">
        {/* Header banner */}
        <div className={`bg-gradient-to-r ${ticket.status === 'Resolved' ? 'from-emerald-500 via-emerald-500/95 to-emerald-500/90' : 'from-primary via-primary/95 to-primary/90'} text-primary-foreground px-8 py-6`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">
                <LifeBuoy className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">{ticket.subject}</h3>
                <p className="text-sm opacity-90 mt-1">Query ID: {ticket.id}</p>
              </div>
            </div>
            <Badge 
              variant={ticket.status === 'Resolved' ? 'default' : 'destructive'}
              className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
            >
              {ticket.status === 'Resolved' ? (
                <CheckCircle className="h-3 w-3 mr-1.5" />
              ) : (
                <Clock className="h-3 w-3 mr-1.5" />
              )}
              {ticket.status}
            </Badge>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm/relaxed opacity-95">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
              <User className="h-4 w-4" />
              <span>{ticket.userName}</span>
            </div>
            {ticket.userEmail && (
              <a href={`mailto:${ticket.userEmail}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors">
                <Mail className="h-4 w-4" />
                <span>{ticket.userEmail}</span>
              </a>
            )}
            {ticket.collegeName && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-sm">
                <FileText className="h-4 w-4" />
                <span>{ticket.collegeName}</span>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-slate-50/50 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Information Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="card-premium rounded-xl border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg">
              <CardHeader className="pb-4 px-6 pt-6">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  Ticket Information
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between py-2 border-b border-border/30">
                    <span className="text-sm font-semibold text-muted-foreground">Issue Type</span>
                    <Badge variant={ticket.issueType === 'Support' ? 'secondary' : 'outline'} className="shadow-sm">
                      {ticket.issueType}
                    </Badge>
                  </div>
                  <div className="flex items-start justify-between py-2 border-b border-border/30">
                    <span className="text-sm font-semibold text-muted-foreground">Date Raised</span>
                    <span className="text-sm font-medium text-right max-w-[60%]">{ticket.dateRaised}</span>
                  </div>
                  <div className="flex items-start justify-between py-2">
                    <span className="text-sm font-semibold text-muted-foreground">Date Closed</span>
                    <span className="text-sm font-medium text-right max-w-[60%]">
                      {ticket.dateClosed || <span className="text-muted-foreground">Not resolved yet</span>}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="card-premium rounded-xl border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg">
              <CardHeader className="pb-4 px-6 pt-6">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/10">
                    <User className="h-4 w-4 text-purple-600" />
                  </div>
                  User Information
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between py-2 border-b border-border/30">
                    <span className="text-sm font-semibold text-muted-foreground">Name</span>
                    <span className="text-sm font-medium text-right max-w-[60%]">{ticket.userName}</span>
                  </div>
                  {ticket.userEmail && (
                    <div className="flex items-start justify-between py-2 border-b border-border/30">
                      <span className="text-sm font-semibold text-muted-foreground">Email</span>
                      <a href={`mailto:${ticket.userEmail}`} className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors text-right max-w-[60%] break-all">
                        {ticket.userEmail}
                      </a>
                    </div>
                  )}
                  {ticket.collegeName && (
                    <div className="flex items-start justify-between py-2">
                      <span className="text-sm font-semibold text-muted-foreground">College</span>
                      <span className="text-sm font-medium text-right max-w-[60%]">{ticket.collegeName}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Description Card */}
          <Card className="card-premium rounded-xl border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg">
            <CardHeader className="pb-4 px-6 pt-6">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10">
                  <FileText className="h-4 w-4 text-emerald-600" />
                </div>
                Description
              </CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6">
              <div className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-lg border border-border/30 text-sm leading-relaxed">
                <p className="text-foreground whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Attachment Card */}
          {ticket.image && (
            <Card className="card-premium rounded-xl border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg">
              <CardHeader className="pb-4 px-6 pt-6">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-500/10">
                    <ImageIcon className="h-4 w-4 text-orange-600" />
                  </div>
                  Attachment
                </CardTitle>
              </CardHeader>
              <CardContent className="px-6 pb-6">
                <div className="rounded-lg border border-border/30 overflow-hidden bg-white">
                  <Image 
                    src={ticket.image} 
                    alt="Ticket Attachment" 
                    width={800} 
                    height={600} 
                    className="w-full h-auto object-cover"
                    data-ai-hint="error screenshot"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
