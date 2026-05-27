import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { portfolioAPI } from '../utils/api';
import { calculateQuality, defaultDraft } from '../utils/helpers';

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState(defaultDraft);
  const [isSaving, setIsSaving] = useState(false);
  const [savedPortfolio, setSavedPortfolio] = useState(null);

  const updateLocalPortfolio = (patch) => setPortfolio((current) => ({ ...current, ...patch }));

  const save = async (payload = portfolio) => {
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
      toast.success('Portfolio saved and ready to share');
      return saved;
    } catch (err) {
      toast.error(err.response?.data?.error || err.response?.data?.message || 'Could not save portfolio');
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const quality = useMemo(() => calculateQuality(portfolio), [portfolio]);

  return { portfolio, updatePortfolio: updateLocalPortfolio, save, isSaving, savedPortfolio, quality };
};
