import React from 'react';
import { motion } from 'framer-motion';
import { FormDescriptionInput } from '@/components/FormDescriptionInput';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ClipLoader } from 'react-spinners';

export default function Home() {
	const [formUrl, setFormUrl] = React.useState<string | null>(null);
	const [isAuthenticated, setIsAuthenticated] = React.useState(false);
	const [isLoading, setIsLoading] = React.useState(false);
	const [lastFormData, setLastFormData] = React.useState<{
		title: string;
		description: string;
	} | null>(null);

	useEffect(() => {
		const tokens = localStorage.getItem('googleTokens');
		if (tokens) {
			setIsAuthenticated(true);
		}
		
		// Restore last form data
		const savedFormData = localStorage.getItem('lastFormData');
		if (savedFormData) {
			setLastFormData(JSON.parse(savedFormData));
		}
	}, []);

	const handleFormSubmit = async (formData: any) => {
		try {
			setIsLoading(true);
			// Save form data to localStorage
			localStorage.setItem('lastFormData', JSON.stringify(formData));
			setLastFormData(formData);
			
			const tokens = localStorage.getItem('googleTokens');
			
			const response = await fetch('/api/createForm', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					tokens: JSON.parse(tokens || '{}'),
					formData,
				}),
			});

			const data = await response.json();
			if (data.success) {
				setFormUrl(data.formUrl);
			}
		} catch (error) {
			console.error('Error creating form:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleTryAgain = () => {
		setFormUrl(null);
	};

	const handleStartNew = () => {
		setFormUrl(null);
		setLastFormData(null);
		localStorage.removeItem('lastFormData');
	};

	const handleAuth = async () => {
		try {
			console.log('Starting auth process...');
			const response = await fetch('/api/auth');
			
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			
			const data = await response.json();
			console.log('Auth response:', data);
			
			if (data.url) {
				console.log('Redirecting to:', data.url);
				window.location.href = data.url;
			} else {
				console.error('No URL in response:', data);
			}
		} catch (error) {
			console.error('Error initiating auth:', error);
			alert('Failed to start authentication. Please check the console for details.');
		}
	};

	return (
		<motion.main className='min-h-screen bg-gray-100 p-8'>
			<div className='max-w-4xl mx-auto'>
				<h1 className='text-4xl font-bold text-center text-gray-800 mb-12'>
					Google Form Generator
				</h1>

				{!isAuthenticated ? (
					<div className="text-center">
						<Button 
							className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-lg"
							onClick={handleAuth}
						>
							Sign in with Google
						</Button>
					</div>
				) : (
					<div>
						{isLoading ? (
							<div className="text-center bg-white p-8 rounded-lg shadow-md">
								<h2 className="text-2xl font-bold text-gray-800 mb-6">Generating Your Form</h2>
								<div className="flex flex-col items-center gap-4">
									<ClipLoader
										color="#2563eb"
										size={50}
										speedMultiplier={0.7}
									/>
									<p className="text-gray-600">
										Please wait while we create your form...
									</p>
								</div>
							</div>
						) : !formUrl ? (
							<FormDescriptionInput 
								onSubmit={handleFormSubmit}
								initialData={lastFormData}
							/>
						) : (
							<div className='text-center bg-white p-8 rounded-lg shadow-md'>
								<h2 className='text-2xl font-bold text-gray-800 mb-4'>Form Created Successfully!</h2>
								<p className='mb-4 text-gray-600'>Your form is ready at:</p>
								<a
									href={formUrl}
									target='_blank'
									rel='noopener noreferrer'
									className='text-blue-600 hover:text-blue-700 underline'
								>
									{formUrl}
								</a>
								<div className="flex justify-center gap-4 mt-8">
									<Button
										className="bg-blue-600 hover:bg-blue-700 text-white"
										onClick={handleTryAgain}
									>
										Try Again with Same Data
									</Button>
									<Button
										className="bg-gray-600 hover:bg-gray-700 text-white"
										onClick={handleStartNew}
									>
										Start New Form
									</Button>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</motion.main>
	);
}
