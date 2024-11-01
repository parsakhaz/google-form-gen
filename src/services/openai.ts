import OpenAI from 'openai';

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

type FormQuestion = {
	type: 'RADIO' | 'CHECKBOX' | 'TEXT' | 'PARAGRAPH' | 'SCALE';
	title: string;
	required: boolean;
	options?: string[];
	scaleMin?: number;
	scaleMax?: number;
	scaleLabels?: {
		low: string;
		high: string;
	};
};

type FormStructure = {
	title: string;
	description?: string;
	questions: FormQuestion[];
};

async function makeOpenAIRequest(description: string, prompt: string, attempt: number = 1): Promise<FormStructure> {
	const MAX_RETRIES = 3;
	
	try {
		const completion = await openai.chat.completions.create({
			model: 'gpt-4o',
			messages: [
				{
					role: 'system',
					content: 'You are a form structure analyzer that converts natural language descriptions into structured JSON for form generation. You only output valid JSON without any markdown formatting or additional text.',
				},
				{
					role: 'user',
					content: prompt,
				}
			],
			response_format: { type: 'json_object' },
			temperature: 0.7,
			max_tokens: 2000,
		});

		const content = completion.choices[0].message.content;
		if (!content) {
			throw new Error('No content in OpenAI response');
		}

		// Clean the response by removing any markdown formatting
		const cleanedContent = content
			.replace(/```json\s*/g, '')  // Remove ```json
			.replace(/```\s*/g, '')      // Remove ```
			.trim();                     // Remove any extra whitespace

		const jsonResponse = JSON.parse(cleanedContent);
		return jsonResponse as FormStructure;
	} catch (error) {
		if (attempt < MAX_RETRIES) {
			console.log(`Attempt ${attempt} failed, retrying...`);
			// Wait for 1 second before retrying (exponential backoff)
			await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
			return makeOpenAIRequest(description, prompt, attempt + 1);
		}
		throw error;
	}
}

export async function parseFormDescription(description: string): Promise<FormStructure> {
	const prompt = `
		Convert the following form description into a structured JSON format for a survey form.
		Rules:
		1. Identify the main topic as the title
		2. Detect question types:
			- Multiple choice questions with listed options should be RADIO
			- Questions asking for ratings should be SCALE (1-5)
			- Questions asking for explanations should be PARAGRAPH
			- Questions with multiple possible answers should be CHECKBOX
			- Simple short answers should be TEXT
		3. For scale questions, include appropriate labels
		4. All questions should be marked as required by default
		5. Maintain the original question intent and meaning
		6. DO NOT include any markdown formatting in your response (no \`\`\` or \`\`\`json)

		Output Format Example:
		{
			"title": "Event Feedback Survey",
			"description": "Help us improve our events",
			"questions": [
				{
					"type": "SCALE",
					"title": "How would you rate the overall experience?",
					"required": true,
					"scaleMin": 1,
					"scaleMax": 5,
					"scaleLabels": {
						"low": "Poor",
						"high": "Excellent"
					}
				},
				{
					"type": "RADIO",
					"title": "Would you recommend this event to others?",
					"required": true,
					"options": ["Yes, definitely", "Maybe", "No"]
				}
			]
		}

		Description to convert:
		${description}

		Remember: Respond only with the JSON object, no additional text or markdown formatting.
	`;

	try {
		console.log('Attempting to parse form description...');
		const formStructure = await makeOpenAIRequest(description, prompt);
		console.log('Successfully parsed form structure');
		return formStructure;
	} catch (error) {
		console.error('All retries failed:', error);
		throw new Error('Failed to parse form description after multiple attempts');
	}
}
