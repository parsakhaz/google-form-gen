import React from 'react';
import { Button } from './ui/button';

interface FormDescriptionInputProps {
  onSubmit: (formData: {
    title: string;
    description: string;
  }) => void;
  initialData?: {
    title: string;
    description: string;
  } | null;
}

export function FormDescriptionInput({ onSubmit, initialData }: FormDescriptionInputProps) {
  const [formData, setFormData] = React.useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleClear = () => {
    setFormData({ title: '', description: '' });
    localStorage.removeItem('lastFormData');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Form Description</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Form Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Form Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 h-32"
            placeholder="Enter each question on a new line. Add 'explain' for paragraph-type questions."
            required
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button 
          type="submit" 
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
        >
          Generate Form
        </Button>
        {initialData && (
          <Button 
            type="button"
            onClick={handleClear}
            className="bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg transition-colors"
          >
            Clear Form
          </Button>
        )}
      </div>
    </form>
  );
} 