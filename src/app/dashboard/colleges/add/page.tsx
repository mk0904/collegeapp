
'use client'

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { addCollege } from "@/lib/firebase/firestore";

export default function AddCollegePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [name, setName] = React.useState('');
    const [location, setLocation] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [loading, setLoading] = React.useState(false);

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
            await addCollege({ name, location, email, phone });
            toast({
                title: "Success!",
                description: "College has been added successfully."
            });
            router.push('/dashboard/projects?tab=colleges');
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Add a New College</CardTitle>
          <CardDescription>Fill out the form below to register a new college.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">College Name</Label>
                    <Input id="name" placeholder="e.g. Kohima Science College" value={name} onChange={e => setName(e.target.value)} required/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="e.g. Jotsoma, Kohima" value={location} onChange={e => setLocation(e.target.value)} required/>
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
                <Button type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add College'}</Button>
            </form>
        </CardContent>
      </Card>
    </div>
  )
}
