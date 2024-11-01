import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Auth endpoint hit with method:', req.method);

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    console.log('OAuth client created with:', {
      clientId: process.env.GOOGLE_CLIENT_ID?.slice(0, 5) + '...',
      redirectUri: process.env.GOOGLE_REDIRECT_URI
    });

    if (req.method === 'GET') {
      // Generate OAuth URL
      const scopes = [
        'https://www.googleapis.com/auth/forms.body',
        'https://www.googleapis.com/auth/forms.responses.readonly'
      ];

      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        include_granted_scopes: true
      });

      console.log('Generated auth URL:', url);
      res.status(200).json({ url });
    } else if (req.method === 'POST') {
      // Handle OAuth callback
      const { code } = req.body;
      try {
        const { tokens } = await oauth2Client.getToken(code);
        res.status(200).json({ tokens });
      } catch (error) {
        console.error('Error getting tokens:', error);
        res.status(500).json({ error: 'Failed to get tokens' });
      }
    }
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
} 