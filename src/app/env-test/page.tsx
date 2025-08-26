'use client';

import { useState, useEffect } from 'react';

export default function EnvTest() {
  const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({});
  
  useEffect(() => {
    // Collect all environment variables that we're interested in
    const env = {
      NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      NODE_ENV: process.env.NODE_ENV,
    };
    
    setEnvVars(env);
  }, []);
  
  const maskApiKey = (key?: string) => {
    if (!key) return 'Not set';
    return key.substring(0, 4) + '...' + key.substring(key.length - 4);
  };
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 rounded-md border">
          <h2 className="text-lg font-medium mb-2">Firebase Configuration</h2>
          <ul className="space-y-2">
            <li>
              <strong>API Key:</strong> {maskApiKey(envVars.NEXT_PUBLIC_FIREBASE_API_KEY)}
              <span className={`ml-2 text-xs ${envVars.NEXT_PUBLIC_FIREBASE_API_KEY ? 'text-green-500' : 'text-red-500'}`}>
                {envVars.NEXT_PUBLIC_FIREBASE_API_KEY ? '✓' : '✗'}
              </span>
            </li>
            <li>
              <strong>Auth Domain:</strong> {envVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not set'}
              <span className={`ml-2 text-xs ${envVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'text-green-500' : 'text-red-500'}`}>
                {envVars.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✓' : '✗'}
              </span>
            </li>
            <li>
              <strong>Project ID:</strong> {envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}
              <span className={`ml-2 text-xs ${envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'text-green-500' : 'text-red-500'}`}>
                {envVars.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✓' : '✗'}
              </span>
            </li>
            <li>
              <strong>Storage Bucket:</strong> {envVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'Not set'}
              <span className={`ml-2 text-xs ${envVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? 'text-green-500' : 'text-red-500'}`}>
                {envVars.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✓' : '✗'}
              </span>
            </li>
            <li>
              <strong>Messaging Sender ID:</strong> {envVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || 'Not set'}
              <span className={`ml-2 text-xs ${envVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? 'text-green-500' : 'text-red-500'}`}>
                {envVars.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ? '✓' : '✗'}
              </span>
            </li>
            <li>
              <strong>App ID:</strong> {envVars.NEXT_PUBLIC_FIREBASE_APP_ID ? 'Set ✓' : 'Not set ✗'}
            </li>
          </ul>
        </div>
        
        <div className="p-4 rounded-md border">
          <h2 className="text-lg font-medium mb-2">Environment</h2>
          <p><strong>NODE_ENV:</strong> {envVars.NODE_ENV || 'Not set'}</p>
        </div>
        
        <div className="mt-4 p-4 rounded-md border bg-yellow-50">
          <h2 className="text-lg font-medium mb-2 text-yellow-800">Troubleshooting</h2>
          <ul className="list-disc pl-5 text-yellow-700">
            <li>Make sure your .env.local file contains all required Firebase variables</li>
            <li>Verify that you've restarted your Next.js server after updating environment variables</li>
            <li>Check that all environment variables are prefixed with NEXT_PUBLIC_ to be accessible on the client side</li>
            <li>If using deployment platforms like Vercel, ensure environment variables are configured there as well</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
