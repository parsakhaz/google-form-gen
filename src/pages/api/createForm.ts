import type { NextApiRequest, NextApiResponse } from 'next';
import { google } from 'googleapis';
import { parseFormDescription } from '@/services/openai';
import { OAuth2Client } from 'google-auth-library';

type ResponseData = {
  success: boolean;
  formUrl?: string;
  error?: string;
  details?: any;
};

// Helper function to refresh token
async function refreshAccessToken(oauth2Client: OAuth2Client, refreshToken: string) {
  try {
    oauth2Client.setCredentials({
      refresh_token: refreshToken
    });
    const { credentials } = await oauth2Client.refreshAccessToken();
    return credentials;
  } catch (error) {
    throw new Error('Failed to refresh access token');
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    console.log('CreateForm endpoint hit');
    const { tokens, formData } = req.body;

    if (!tokens || !tokens.access_token) {
      console.error('Missing tokens:', tokens);
      return res.status(400).json({ 
        success: false, 
        error: 'Missing authentication tokens',
        details: { hasTokens: !!tokens }
      });
    }

    if (!formData || !formData.title) {
      console.error('Missing form data:', formData);
      return res.status(400).json({ 
        success: false, 
        error: 'Missing form data',
        details: { hasFormData: !!formData }
      });
    }

    console.log('Parsing form description with OpenAI...');
    const formStructure = await parseFormDescription(formData.description);

    console.log('Generated form structure:', formStructure);

    console.log('Creating OAuth2 client...');
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );

    console.log('Setting credentials...');
    oauth2Client.setCredentials({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    });

    console.log('Initializing Forms API...');
    const forms = google.forms({ version: 'v1', auth: oauth2Client });

    // Step 1: Create the form with only the title
    console.log('Creating form with title...');
    const form = await forms.forms.create({
      requestBody: {
        info: {
          title: formStructure.title,
        },
      },
    });

    if (!form.data.formId) {
      throw new Error('No formId returned from API');
    }

    // Step 2: Update the form with description and settings
    if (formStructure.description) {
      console.log('Updating form settings...');
      await forms.forms.batchUpdate({
        formId: form.data.formId,
        requestBody: {
          requests: [
            {
              updateFormInfo: {
                info: {
                  description: formStructure.description,
                },
                updateMask: 'description',
              },
            }
          ],
        },
      });
    }

    // Step 3: Parse and add questions
    if (formStructure.questions.length > 0) {
      console.log('Adding questions:', formStructure.questions);
      await forms.forms.batchUpdate({
        formId: form.data.formId,
        requestBody: {
          requests: formStructure.questions.map((question, index) => ({
            createItem: {
              item: {
                title: question.title,
                questionItem: {
                  question: {
                    required: question.required,
                    ...(question.type === 'RADIO' && {
                      choiceQuestion: {
                        type: 'RADIO',
                        options: question.options?.map(opt => ({ value: opt })) || []
                      }
                    }),
                    ...(question.type === 'CHECKBOX' && {
                      choiceQuestion: {
                        type: 'CHECKBOX',
                        options: question.options?.map(opt => ({ value: opt })) || []
                      }
                    }),
                    ...(question.type === 'TEXT' && {
                      textQuestion: {
                        paragraph: false
                      }
                    }),
                    ...(question.type === 'PARAGRAPH' && {
                      textQuestion: {
                        paragraph: true
                      }
                    }),
                    ...(question.type === 'SCALE' && {
                      scaleQuestion: {
                        low: question.scaleMin || 1,
                        high: question.scaleMax || 5,
                        lowLabel: question.scaleLabels?.low,
                        highLabel: question.scaleLabels?.high
                      }
                    })
                  }
                }
              },
              location: { index }
            }
          }))
        }
      });
    }

    console.log('Form completed with URL:', form.data.responderUri);

    return res.status(200).json({
      success: true,
      formUrl: form.data.responderUri || '',
    });
  } catch (error: any) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create form',
      details: error.response?.data || error
    });
  }
} 