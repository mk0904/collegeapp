
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
import { getAdminUserById, updateAdminUserProfile } from "@/lib/firebase/firestore";

export default function AccountPage() {
    const { toast } = useToast();
    const [user, setUser] = React.useState<any | null>(null);
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
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                try {
                    const userData = await getAdminUserById(currentUser.uid);
                    if (userData) {
                        setUser(userData);
                        // Set form values from user data, ensuring defaults for empty values
                        setName(userData.name || '');
                        setEmail(userData.email || '');
                        setPhone(userData.phoneNumber || userData.phone || '');
                        setDesignation(userData.designation || '');
                    } else {
                        // If getAdminUserById returns null, create basic user data from auth
                        setUser({
                            id: currentUser.uid,
                            uid: currentUser.uid,
                            name: currentUser.displayName || '',
                            email: currentUser.email || '',
                            phone: '',
                            phoneNumber: '',
                            active: true,
                            status: 'Active',
                            role: 'admin',
                            createdOn: new Date().toISOString(),
                        });
                        
                        // Set form values from auth user
                        setName(currentUser.displayName || '');
                        setEmail(currentUser.email || '');
                    }
                } catch (error) {
                    console.error("Error fetching admin user data:", error);
                    toast({ title: "Error", description: "Failed to fetch profile data.", variant: "destructive" });
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
                // Handle case where user is not logged in
            }
        });
        return () => unsubscribe();
    }, [toast]);

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Get current authenticated user
        const currentAuthUser = auth.currentUser;
        if (!currentAuthUser) {
            toast({ title: "Error", description: "You must be logged in to update your profile.", variant: "destructive" });
            return;
        }
        
        setIsUpdatingProfile(true);
        try {
            // Update admin user profile with current form values
            await updateAdminUserProfile(currentAuthUser.uid, { 
                name, 
                phoneNumber: phone, // Use phoneNumber field (primary)
                phone: phone, // Keep legacy field for compatibility
                designation,
                email // Include email for new users
            });
            
            // Update local state
            setUser(prev => prev ? { ...prev, name, phone, designation } : null);
            
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
            if (!currentUser.email) {
                throw new Error("User email is not available.");
            }
            const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
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
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-12" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                      </div>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-20" />
                            <Skeleton className="h-10 w-full" />
                        </div>
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
