import { google } from 'googleapis';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { tokens } = req.body;

    if (!tokens || !tokens.access_token) {
        return res.status(400).json({ error: 'No tokens provided' });
    }

    try {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );

        oauth2Client.setCredentials(tokens);

        // This will throw an error if the token is invalid
        await oauth2Client.getTokenInfo(tokens.access_token);

        return res.status(200).json({ valid: true });
    } catch (error) {
        console.error('Token validation error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
} 