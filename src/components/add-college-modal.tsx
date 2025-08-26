
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
    const [loading, setLoading] = React.useState(false);

    const resetForm = () => {
        setName('');
        setLocation('');
        setDistrict('');
        setEmail('');
        setPhone('');
        setLatitude('');
        setLongitude('');
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New College</DialogTitle>
          <DialogDescription>Fill out the form below to register a new college.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="name">College Name</Label>
                <Input id="name" placeholder="e.g. Kohima Science College" value={name} onChange={e => setName(e.target.value)} required/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="e.g. Jotsoma, Kohima" value={location} onChange={e => setLocation(e.target.value)} required/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Input id="district" placeholder="e.g. Kohima" value={district} onChange={e => setDistrict(e.target.value)} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input id="latitude" type="number" placeholder="e.g. 25.6751" value={latitude} onChange={e => setLatitude(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input id="longitude" type="number" placeholder="e.g. 94.1027" value={longitude} onChange={e => setLongitude(e.target.value)} />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input id="email" type="email" placeholder="e.g. principal@ksc.ac.in" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Contact Phone</Label>
                    <Input id="phone" placeholder="e.g. +91 98765 43210" value={phone} onChange={e => setPhone(e.target.value)} />
                </div>
            </div>
            <DialogFooter>
                 <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
                <Button type="submit" disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Adding...' : 'Add College'}
                </Button>
            </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
