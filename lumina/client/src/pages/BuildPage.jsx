import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import AnimatedBackground from '../components/AnimatedBackground';
import AuthPromptModal from '../components/AuthPromptModal';
import LoadingScreen from '../components/LoadingScreen';
import Navbar from '../components/Navbar';
import PortfolioForm from '../components/PortfolioForm';
import { useAuth } from '../context/AuthContext';
import { useGemini } from '../hooks/useGemini';
import { portfolioAPI } from '../utils/api';

const BuildPage = () => {
  const reduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const { generate, isGenerating } = useGemini();
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const handleStepChange = useCallback((step) => {
    if (step >= 4 && !isLoading && !isAuthenticated) setShowAuthPrompt(true);
  }, [isAuthenticated, isLoading]);

  const handleComplete = async (formData) => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }
    const ai = await generate(formData);
    if (!ai) return;
    const portfolio = {
      ...formData,
      bioVersions: [ai.bio.version1, ai.bio.version2, ai.bio.version3].filter(Boolean),
      selectedBio: ai.bio.version1 || formData.bioNotes,
      tagline: ai.tagline,
      projects: formData.projects.map((project, index) => ({ ...project, description: ai.projectDescriptions?.[index] || project.description })),
      layout: ai.layoutSuggestion || formData.layout || 'premium',
      template: ai.layoutSuggestion || formData.template || 'premium',
      colorPalette: ai.colorPalette,
      skillsHeadline: ai.skillsHeadline,
      generationMetadata: ai.metadata
    };
    let savedPortfolio = portfolio;
    try {
      savedPortfolio = await portfolioAPI.create(portfolio);
    } catch (error) {
      savedPortfolio = portfolio;
    }
    navigate('/preview', { state: { portfolio: savedPortfolio, ai } });
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] px-4 py-28 text-white">
      <AnimatedBackground />
      <Navbar compact />
      <motion.div
        initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-5xl"
      >
        <div className="mb-8">
          <p className="text-sm font-bold text-[#c084fc]">Lumina Studio builder</p>
          <h1 className="gradient-text mt-2 font-display text-5xl font-black">Build a portfolio that feels ready.</h1>
          <p className="mt-3 max-w-2xl text-white/50">Autosave is on. You can resume drafts, tune AI strategy, and upgrade plan controls before export.</p>
        </div>
        {isGenerating ? <LoadingScreen /> : <PortfolioForm onComplete={handleComplete} isGenerating={isGenerating} onStepChange={handleStepChange} />}
      </motion.div>
      <AnimatePresence>
        {showAuthPrompt && !isAuthenticated && (
          <AuthPromptModal onClose={() => setShowAuthPrompt(false)} />
        )}
      </AnimatePresence>
    </main>
  );
};

export default BuildPage;
