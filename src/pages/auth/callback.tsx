import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Callback() {
  const router = useRouter();
  const { code } = router.query;

  useEffect(() => {
    if (code) {
      // Exchange code for tokens
      fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.tokens) {
            // Store tokens in localStorage or state management
            localStorage.setItem('googleTokens', JSON.stringify(data.tokens));
            router.push('/');
          }
        })
        .catch(error => {
          console.error('Error exchanging code for tokens:', error);
        });
    }
  }, [code, router]);

  return (
    <div className="min-h-screen bg-black p-8 text-white">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Authenticating...</h1>
        <p>Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
} 