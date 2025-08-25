'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Logo from '@/components/logo';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex w-screen h-screen overflow-hidden bg-white">
      {/* Left side illustration - only visible on md and larger screens */}
      <div className="hidden md:flex md:w-1/2 bg-primary items-center justify-center relative overflow-hidden">
        {/* Background decorative elements */}
        <div className='absolute top-0 left-0 w-full h-full'>
          <div className='absolute top-[20%] left-[10%] w-48 h-48 rounded-full bg-white opacity-20 shadow-lg shadow-white/20'></div>
          <div className='absolute bottom-[30%] right-[15%] w-64 h-64 rounded-full bg-white opacity-15 shadow-lg shadow-white/15'></div>
          <div className='absolute top-[60%] left-[20%] w-32 h-32 rounded-full bg-white opacity-10 shadow-lg shadow-white/10'></div>
          
          {/* Enhanced decorative elements with shadows */}
          <div className='absolute top-[15%] right-[20%] w-3 h-20 bg-white/20 rounded-full shadow-lg shadow-primary-dark/30 blur-[1px]'></div>
          <div className='absolute top-[75%] left-[15%] w-3 h-16 bg-white/20 rounded-full shadow-lg shadow-primary-dark/30 blur-[1px]'></div>
          
          {/* Geometric shapes with shadows */}
          <div className='absolute top-[35%] right-[25%] w-12 h-12 rounded-full border border-white/20 backdrop-blur-sm shadow-xl shadow-primary-dark/40'></div>
          
          {/* Floating horizontal lines with glow */}
          <div className='absolute top-[45%] left-[65%] w-32 h-[2px] bg-white/25 rounded-full shadow-md shadow-white/30 blur-[0.5px]'></div>
          
          {/* Star-like dots with glow */}
          <div className='absolute top-[25%] left-[40%] w-1.5 h-1.5 bg-white/60 rounded-full shadow-md shadow-white/30 blur-[0.5px]'></div>
          <div className='absolute top-[65%] right-[30%] w-2 h-2 bg-white/60 rounded-full shadow-md shadow-white/30 blur-[0.5px]'></div>
          
          {/* Small glowing orb */}
          <div className='absolute top-[22%] left-[55%] w-3 h-3 rounded-full bg-white/20 shadow-lg shadow-white/30 blur-[2px]'></div>
          
          {/* Wavy pattern at the bottom */}
          <div className='absolute bottom-0 left-0 w-full h-32 opacity-20'>
            <svg viewBox='0 0 1200 120' preserveAspectRatio='none' className='w-full h-full'>
              <path d='M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z' className='fill-white'></path>
              <path d='M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z' className='fill-white opacity-50'></path>
            </svg>
          </div>
        </div>

        <div className="absolute top-8 left-8 z-10">
          <Logo onDarkBg={true} />
        </div>
        
        <div className="max-w-lg text-center z-10 px-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">College Administration Portal</h1>
          <p className="text-lg text-blue-100 mb-8">Manage your institution efficiently with our comprehensive administration tools.</p>
          
          <div className="backdrop-blur-sm bg-white/10 p-5 rounded-xl border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
            <p className="text-white font-medium italic">"Education is the passport to the future, for tomorrow belongs to those who prepare for it today."</p>
            <p className="mt-2 text-sm text-blue-200">— Malcolm X</p>
          </div>
        </div>
        
        {/* Floating badges at bottom */}
        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4">
          <div className="backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full border border-white/20 text-white text-sm font-medium">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Secure Access
            </span>
          </div>
          <div className="backdrop-blur-sm bg-white/10 px-4 py-2 rounded-full border border-white/20 text-white text-sm font-medium">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Protected Data
            </span>
          </div>
        </div>
      </div>
      
      {/* Right side login form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-4 relative">
        {/* Enhanced decorative elements */}
        <div className="absolute top-[10%] right-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-r from-blue-100/40 to-blue-50/30 opacity-70 blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[40%] rounded-full bg-gradient-to-r from-blue-50/30 to-primary/10 opacity-60 blur-3xl"></div>
        <div className="absolute top-[40%] left-[30%] w-[15%] h-[15%] rounded-full bg-primary/10 opacity-60 blur-2xl"></div>
        
        <div className="w-full max-w-md relative z-10 px-4">
          <Card className="shadow-xl border border-gray-100 bg-white/80 backdrop-blur-md relative overflow-hidden rounded-2xl">
            <div className="absolute top-[-80px] right-[-80px] w-48 h-48 rounded-full bg-blue-400/10 blur-xl"></div>
            <div className="absolute bottom-[-60px] left-[-60px] w-40 h-40 rounded-full bg-primary/10 blur-xl"></div>
            <div className="absolute top-[20%] right-[15%] w-24 h-24 rounded-full bg-primary/5 blur-sm"></div>
            <div className="absolute bottom-[20%] left-[10%] w-20 h-20 rounded-full bg-blue-300/5 blur-sm"></div>
            
            <CardHeader className="space-y-3 pb-3 relative z-10">
              <div className="md:hidden mb-3 flex justify-center">
                <Logo onDarkBg={false} />
              </div>
              <CardTitle className="text-2xl font-bold text-center text-gray-800">Welcome Back</CardTitle>
              <CardDescription className="text-center text-sm">Enter your credentials to access your account</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4 relative z-10 px-6 backdrop-blur-sm">
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/80 backdrop-blur-sm border border-gray-200/80 hover:border-primary focus:border-primary focus-visible:ring-1 focus-visible:ring-primary h-11 shadow-md rounded-lg"
                    />
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                    <Link href="#" className="text-xs text-primary hover:underline font-medium">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-white/80 backdrop-blur-sm border border-gray-200/80 hover:border-primary focus:border-primary focus-visible:ring-1 focus-visible:ring-primary h-11 shadow-md rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white font-medium text-base transition-all shadow-lg hover:shadow-xl rounded-xl backdrop-blur-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Logging in...
                      </div>
                    ) : (
                      'Login'
                    )}
                  </Button>
                </div>
              </form>
              
              <div className="text-center text-sm text-gray-600 pt-2">
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary font-medium hover:underline hover:text-primary/80 active:text-primary/70 cursor-pointer">
                  Create account
                </Link>
              </div>
            </CardContent>
          </Card>
          
          <p className="text-center mt-6 text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <Link href="#" className="text-primary hover:underline">Terms of Service</Link> and{' '}
            <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
          </p>
        </div>
      </div>
      
      <footer className="fixed bottom-2 w-full text-center text-xs text-gray-500 z-10">
        <p>&copy; {new Date().getFullYear()} Government of Nagaland. All rights reserved.</p>
      </footer>
    </div>
  );
}
