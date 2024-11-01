import React from 'react';
import { Button } from './ui/button';

interface ApiKeyInputProps {
  onSubmit: (credentials: {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
  }) => void;
}

export function ApiKeyInput({ onSubmit }: ApiKeyInputProps) {
  const [credentials, setCredentials] = React.useState({
    clientId: '',
    clientSecret: '',
    redirectUri: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(credentials);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Google API Credentials</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client ID
          </label>
          <input
            type="text"
            value={credentials.clientId}
            onChange={(e) => setCredentials(prev => ({ ...prev, clientId: e.target.value }))}
            className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client Secret
          </label>
          <input
            type="password"
            value={credentials.clientSecret}
            onChange={(e) => setCredentials(prev => ({ ...prev, clientSecret: e.target.value }))}
            className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Redirect URI
          </label>
          <input
            type="url"
            value={credentials.redirectUri}
            onChange={(e) => setCredentials(prev => ({ ...prev, redirectUri: e.target.value }))}
            className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            required
          />
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
      >
        Save Credentials
      </Button>
    </form>
  );
} 