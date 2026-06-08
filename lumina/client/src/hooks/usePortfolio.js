import { useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { portfolioAPI } from '../utils/api';
import { calculateQuality, defaultDraft } from '../utils/helpers';

const showSaveError = (message) => {
  toast.error(message, { id: `portfolio-save-error:${message}` });
};

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState(defaultDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [savedPortfolio, setSavedPortfolio] = useState(null);
  const savingRef = useRef(false);

  const updateLocalPortfolio = (patch) => setPortfolio((current) => ({ ...current, ...patch }));

  const save = async (payload = portfolio, options = {}) => {
    if (savingRef.current) return null;

    const { showToasts = true } = options;
    savingRef.current = true;
    setIsSaving(true);
    try {
      const quality = calculateQuality(payload);
      const completePayload = { ...payload, qualityScore: quality.score };
      const id = payload.id || payload._id;
      const saved = id
        ? await portfolioAPI.update(id, completePayload)
        : await portfolioAPI.create(completePayload);
      setSavedPortfolio(saved);
      setPortfolio(saved);
      if (showToasts) toast.success('Portfolio saved and ready to share', { id: 'portfolio-save-success' });
      return saved;
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || 'Could not save portfolio';
      if (showToasts) showSaveError(message);
      return null;
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const quality = useMemo(() => calculateQuality(portfolio), [portfolio]);

  return { portfolio, updatePortfolio: updateLocalPortfolio, save, isSaving, savedPortfolio, quality };
};
