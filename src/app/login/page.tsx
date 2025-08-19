'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/logo';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="hidden bg-sidebar lg:flex lg:flex-col items-center justify-center p-8 text-sidebar-foreground">
        <div className="text-center">
            <Logo onDarkBg={true} />
            <h1 className="text-4xl font-bold mt-4">College App</h1>
            <p className="text-lg mt-2 text-sidebar-foreground/80">Government of Nagaland</p>
        </div>
        <div className="absolute bottom-8 text-center text-sidebar-foreground/60 text-sm">
            <p>&copy; {new Date().getFullYear()} Government of Nagaland. All rights reserved.</p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
        <div className="mx-auto grid w-[350px] gap-8">
            <Card className="border-none shadow-none">
                <CardHeader>
                    <CardTitle className="text-3xl font-bold font-headline">Welcome Back</CardTitle>
                    <p className="text-muted-foreground">Enter your credentials to access the admin panel.</p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="grid gap-4">
                        <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            placeholder="admin@example.com" 
                            required 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        </div>
                        <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <Link href="#" className="ml-auto inline-block text-sm underline">
                            Forgot your password?
                            </Link>
                        </div>
                        <Input 
                            id="password" 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>
                    <div className="mt-6 text-center text-sm">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="underline font-semibold">
                            Sign up
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
