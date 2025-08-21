'use client'

import * as React from "react";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { getUserById, updateUserProfile } from "@/lib/firebase/firestore";
import type { User } from "@/lib/mock-data";

export default function AccountPage() {
    const { toast } = useToast();
    const [user, setUser] = React.useState<User | null>(null);
    const [loading, setLoading] = React.useState(true);

    const [name, setName] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [phone, setPhone] = React.useState('');
    const [designation, setDesignation] = React.useState('');
    
    const [currentPassword, setCurrentPassword] = React.useState('');
    const [newPassword, setNewPassword] = React.useState('');
    const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);
    const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);


    React.useEffect(() => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            getUserById(currentUser.uid)
                .then(userData => {
                    if (userData) {
                        setUser(userData);
                        setName(userData.name);
                        setEmail(userData.email);
                        setPhone(userData.phone);
                        setDesignation(userData.designation || '');
                    }
                })
                .catch(error => {
                    console.error("Error fetching user data:", error);
                    toast({ title: "Error", description: "Failed to fetch profile data.", variant: "destructive" });
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [toast]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsUpdatingProfile(true);
        try {
            await updateUserProfile(user.id, { name, phone, designation });
            toast({ title: "Success", description: "Profile updated successfully." });
        } catch (error) {
            console.error("Error updating profile:", error);
            toast({ title: "Error", description: "Failed to update profile.", variant: "destructive" });
        } finally {
            setIsUpdatingProfile(false);
        }
    }
    
    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const currentUser = auth.currentUser;
        if (!currentUser || !currentPassword || !newPassword) {
            toast({ title: "Error", description: "Please fill in all password fields.", variant: "destructive"});
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const credential = EmailAuthProvider.credential(currentUser.email!, currentPassword);
            await reauthenticateWithCredential(currentUser, credential);
            await updatePassword(currentUser, newPassword);
            toast({ title: "Success", description: "Password updated successfully. You will be logged out shortly." });
            setTimeout(() => auth.signOut(), 3000);
        } catch (error) {
            console.error("Error updating password:", error);
            toast({ title: "Error", description: "Failed to update password. Please check your current password.", variant: "destructive" });
        } finally {
            setIsUpdatingPassword(false);
        }
    }

  if (loading) {
      return (
          <div className="space-y-6 max-w-4xl mx-auto">
              <div>
                  <h3 className="text-lg font-medium font-headline">Account</h3>
                  <p className="text-sm text-muted-foreground">
                      Manage your account settings.
                  </p>
              </div>
              <Separator />
              <Card>
                  <CardHeader>
                      <CardTitle>Profile</CardTitle>
                      <CardDescription>Update your personal information.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                      </div>
                      <Skeleton className="h-10 w-32" />
                  </CardContent>
              </Card>
          </div>
      )
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h3 className="text-lg font-medium font-headline">Account</h3>
        <p className="text-sm text-muted-foreground">
          Manage your account settings.
        </p>
      </div>
      <Separator />

      <form onSubmit={handleProfileUpdate}>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number</Label>
                  <Input id="contact" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="space-y-2">
                  <Label htmlFor="designation">Designation</Label>
                  <Input id="designation" value={designation} onChange={e => setDesignation(e.target.value)} />
              </div>
            </div>
            <Button type="submit" disabled={isUpdatingProfile}>
                {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
            </Button>
          </CardContent>
        </Card>
      </form>
      
      <form onSubmit={handlePasswordUpdate}>
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
            </div>
            <Button type="submit" disabled={isUpdatingPassword}>
                {isUpdatingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
