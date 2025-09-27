'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth';
import { doc, deleteDoc } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function DeleteAccountPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('You must be logged in to delete your account.');
      }

      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);

      try {
        await deleteDoc(doc(db, 'users', user.uid));
      } catch (_) {}

      await deleteUser(user);

      toast({ title: 'Account deleted', description: 'Your account has been permanently removed.' });
      router.push('/');
    } catch (error: any) {
      const message = mapAuthError(error);
      toast({ title: 'Deletion failed', description: message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='flex w-full justify-center p-4'>
      <div className='w-full max-w-md'>
        <Card>
          <CardHeader>
            <CardTitle>Delete Account</CardTitle>
            <CardDescription>
              To permanently delete your account, confirm your email and password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleDelete} className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='email'>Email</Label>
                <Input id='email' type='email' value={email} onChange={(e) => setEmail(e.target.value)} placeholder='you@example.com' required />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='password'>Password</Label>
                <Input id='password' type='password' value={password} onChange={(e) => setPassword(e.target.value)} placeholder='••••••••' required />
              </div>
              <Button type='submit' disabled={loading} variant='destructive' className='w-full'>
                {loading ? 'Deleting…' : 'Delete my account'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function mapAuthError(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'The email or password is incorrect.';
    case 'auth/user-mismatch':
      return 'The email does not match the signed-in account.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later.';
    default:
      return error?.message || 'Unexpected error occurred.';
  }
}

