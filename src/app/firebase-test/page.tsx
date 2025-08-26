'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function FirebaseTest() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [collections, setCollections] = useState<string[]>([]);

  useEffect(() => {
    async function testFirebase() {
      try {
        // Try to connect to Firestore and list collections
        const snapshot = await getDocs(collection(db, 'circulars'));
        setCollections(['circulars']);
        
        // If we get here, the connection was successful
        setStatus('success');
        console.log('Firebase connection successful!');
      } catch (err) {
        console.error('Firebase connection error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }

    testFirebase();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Firebase Connection Test</h1>
      
      <div className="space-y-4">
        <div className="p-4 rounded-md border">
          <h2 className="text-lg font-medium mb-2">Connection Status</h2>
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2 ${
              status === 'loading' ? 'bg-yellow-500' :
              status === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`}></div>
            <span>{status}</span>
          </div>
        </div>
        
        {status === 'success' && (
          <div className="p-4 rounded-md border">
            <h2 className="text-lg font-medium mb-2">Available Collections</h2>
            <ul className="list-disc pl-5">
              {collections.map(col => (
                <li key={col}>{col}</li>
              ))}
              {collections.length === 0 && <li className="text-gray-500">No collections found</li>}
            </ul>
          </div>
        )}
        
        {status === 'error' && (
          <div className="p-4 rounded-md border border-red-200 bg-red-50">
            <h2 className="text-lg font-medium mb-2 text-red-700">Error</h2>
            <pre className="text-sm text-red-600 whitespace-pre-wrap">{error}</pre>
          </div>
        )}
      </div>
      
      <div className="mt-8 p-4 rounded-md border bg-gray-50">
        <h2 className="text-lg font-medium mb-2">Firebase Configuration</h2>
        <pre className="text-sm whitespace-pre-wrap overflow-auto max-h-48">
          {`Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'Not set'}\n`}
          {`API Key: ${process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '********' : 'Not set'}\n`}
          {`Auth Domain: ${process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'Not set'}`}
        </pre>
      </div>
    </div>
  );
}
