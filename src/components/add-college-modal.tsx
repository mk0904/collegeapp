
'use client'

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addCollege } from "@/lib/firebase/firestore";
import { Loader2 } from "lucide-react";

interface AddCollegeModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCollegeAdded: () => void;
}

export function AddCollegeModal({ isOpen, onOpenChange, onCollegeAdded }: AddCollegeModalProps) {
    const { toast } = useToast();
    const [name, setName] = React.useState('');
    const [location, setLocation] = React.useState('');
    const [district, setDistrict] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [latitude, setLatitude] = React.useState('');
    const [longitude, setLongitude] = React.useState('');
    const [startTime, setStartTime] = React.useState('');
    const [endTime, setEndTime] = React.useState('');
    const [maxDistance, setMaxDistance] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const resetForm = () => {
        setName('');
        setLocation('');
        setDistrict('');
        setEmail('');
        setPhone('');
        setLatitude('');
        setLongitude('');
        setStartTime('');
        setEndTime('');
        setMaxDistance('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !location) {
            toast({
                title: "Error",
                description: "College Name and Location are required.",
                variant: "destructive"
            });
            return;
        }
        setLoading(true);
        try {
            await addCollege({ 
                name, 
                location,
                district,
                email, 
                phone,
                latitude: latitude ? parseFloat(latitude) : undefined,
                longitude: longitude ? parseFloat(longitude) : undefined,
                startTime: startTime ? parseInt(startTime) : undefined,
                endTime: endTime ? parseInt(endTime) : undefined,
                maxDistance: maxDistance ? parseInt(maxDistance) : undefined,
            });
            toast({
                title: "Success!",
                description: "College has been added successfully."
            });
            onCollegeAdded();
            onOpenChange(false);
            resetForm();
        } catch (error) {
            console.error("Error adding college:", error);
            toast({
                title: "Error",
                description: "Failed to add college. Please try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl rounded-2xl border-0 shadow-2xl">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl font-bold">Add a New College</DialogTitle>
          <DialogDescription className="text-sm mt-1">Fill out the form below to register a new college.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Basic Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">College Name <span className="text-destructive">*</span></Label>
                  <Input 
                    id="name" 
                    placeholder="e.g. Kohima Science College" 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required
                    className="h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium">Location <span className="text-destructive">*</span></Label>
                  <Input 
                    id="location" 
                    placeholder="e.g. Jotsoma, Kohima" 
                    value={location} 
                    onChange={e => setLocation(e.target.value)} 
                    required
                    className="h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district" className="text-sm font-medium">District</Label>
                  <Input 
                    id="district" 
                    placeholder="e.g. Kohima" 
                    value={district} 
                    onChange={e => setDistrict(e.target.value)}
                    className="h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200"
                  />
                </div>
              </div>
            </div>
            {/* Contact Information Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Contact Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="e.g. principal@ksc.ac.in" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)}
                    className="h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">Contact Phone</Label>
                  <Input 
                    id="phone" 
                    placeholder="e.g. +91 98765 43210" 
                    value={phone} 
                    onChange={e => setPhone(e.target.value)}
                    className="h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Geofencing Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Geofencing Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="text-sm font-medium">Latitude</Label>
                  <Input 
                    id="latitude" 
                    type="number" 
                    step="0.000001"
                    placeholder="e.g. 25.6751" 
                    value={latitude} 
                    onChange={e => setLatitude(e.target.value)}
                    className="h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude" className="text-sm font-medium">Longitude</Label>
                  <Input 
                    id="longitude" 
                    type="number" 
                    step="0.000001"
                    placeholder="e.g. 94.1027" 
                    value={longitude} 
                    onChange={e => setLongitude(e.target.value)}
                    className="h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxDistance" className="text-sm font-medium">Max Distance (km)</Label>
                <Input 
                  id="maxDistance" 
                  type="number" 
                  min="0" 
                  step="0.1"
                  placeholder="e.g. 2" 
                  value={maxDistance} 
                  onChange={e => setMaxDistance(e.target.value)}
                  className="h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200"
                />
                <p className="text-xs text-muted-foreground">Maximum geofence distance in kilometers</p>
              </div>
            </div>

            {/* Attendance Timing Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Attendance Timing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-sm font-medium">Start Time (Hour)</Label>
                  <Input 
                    id="startTime" 
                    type="number" 
                    min="0" 
                    max="23" 
                    placeholder="e.g. 2" 
                    value={startTime} 
                    onChange={e => setStartTime(e.target.value)}
                    className="h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200"
                  />
                  <p className="text-xs text-muted-foreground">24-hour format (0-23)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime" className="text-sm font-medium">End Time (Hour)</Label>
                  <Input 
                    id="endTime" 
                    type="number" 
                    min="0" 
                    max="23" 
                    placeholder="e.g. 22" 
                    value={endTime} 
                    onChange={e => setEndTime(e.target.value)}
                    className="h-10 rounded-xl border-border/50 bg-white/50 backdrop-blur-sm focus:bg-white transition-all duration-200"
                  />
                  <p className="text-xs text-muted-foreground">24-hour format (0-23)</p>
                </div>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border/50">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                disabled={loading}
                className="rounded-xl h-10"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading}
                className="btn-premium bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-md hover:shadow-lg transition-all duration-300 rounded-xl h-10"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Adding...' : 'Add College'}
              </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
