# Google Form Generator

A Next.js application that allows users to generate Google Forms programmatically using OAuth 2.0 authentication.

## Prerequisites

Before you begin, you need to:

1. Have a Google Account
2. Set up a Google Cloud Project

## Initial Setup

### 1. Google Cloud Project Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Forms API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Forms API"
   - Click "Enable"

### 2. OAuth 2.0 Credentials Setup

1. In Google Cloud Console:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"

2. Configure OAuth consent screen:
   - Go to "OAuth consent screen"
   - Choose "External" user type
   - Fill in required app information
   - Add scopes:
     - `https://www.googleapis.com/auth/forms.body`
     - `https://www.googleapis.com/auth/forms.responses.readonly`

3. Configure authorized redirect URIs:
   - Add: `http://localhost:3000/auth/callback` (for development)
   - Add your production URL if deploying

4. After creating, you'll receive:
   - Client ID
   - Client Secret

### 3. Local Environment Setup

1. Clone the repository:

~~~bash
git clone https://github.com/yourusername/google-form-generator.git
cd google-form-generator
~~~

2. Install dependencies:

~~~bash
npm install
# or
yarn install
~~~

3. Create a `.env.local` file in the root directory:

~~~plaintext
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
NEXT_PUBLIC_API_URL=http://localhost:3000/api
~~~

4. Start the development server:

~~~bash
npm run dev
# or
yarn dev
~~~

## Usage

1. Visit `http://localhost:3000`
2. Click "Sign in with Google"
3. Authorize the application
4. Enter your form details:
   - Title
   - Description/Questions (one per line)
   - Add "explain" to any question that should be a paragraph-type response
5. Click "Generate Form"
6. Use the generated form URL to access your new Google Form

## Features

- OAuth 2.0 authentication with Google
- Automatic form generation
- Support for text and paragraph questions
- Direct integration with user's Google account
- Forms appear in user's Google Drive

## Development Notes

- The application uses the Google Forms API v1
- Forms are created under the authenticated user's account
- Questions are parsed from the description field (one per line)
- Questions containing "explain" are created as paragraph-type questions

## Troubleshooting

1. If authentication fails:
   - Verify your OAuth credentials
   - Check that redirect URIs are correctly configured
   - Ensure all required scopes are added to the consent screen

2. If form creation fails:
   - Verify the Google Forms API is enabled
   - Check the user has granted necessary permissions
   - Review API quotas in Google Cloud Console

## Security Notes

- OAuth tokens are stored in localStorage (consider more secure alternatives for production)
- Always use HTTPS in production
- Keep your Google Cloud credentials secure
