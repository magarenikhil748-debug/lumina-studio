import { useState } from 'react';
import toast from 'react-hot-toast';
import { generatePortfolio } from '../utils/api';

export const useGemini = () => {
  const [generation, setGeneration] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  const generate = async (payload) => {
    setIsGenerating(true);
    setError('');
    try {
      const result = await generatePortfolio(payload);
      setGeneration(result);
      toast.success(result.metadata?.fallback ? 'Fallback content generated' : 'AI direction generated', { id: 'gemini-generate-success' });
      return result;
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Generation took too long. Try again in a moment.';
      setError(message);
      toast.error(message, { id: `gemini-generate-error:${message}` });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  return { generation, isGenerating, error, generate };
};
