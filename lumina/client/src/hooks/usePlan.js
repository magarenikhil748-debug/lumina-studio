import { useCallback, useEffect, useMemo, useState } from 'react';
import { userAPI } from '../utils/api';

const fallbackPlan = {
  plan: 'starter',
  limits: {},
  planLimits: {},
  canAccess: () => false,
  isTrialing: false,
  trialEndsAt: null,
  gracePeriodEndsAt: null,
  inGracePeriod: false,
  isLoading: true,
  error: null,
  refetch: async () => null
};

export const usePlan = () => {
  const [state, setState] = useState({ ...fallbackPlan });

  const fetchPlan = useCallback(async () => {
    setState((current) => ({ ...current, isLoading: true, error: null }));
    try {
      const data = await userAPI.getPlan();
      setState({
        ...data,
        limits: data.planLimits || {},
        isLoading: false,
        error: null
      });
      return data;
    } catch (error) {
      setState((current) => ({
        ...current,
        isLoading: false,
        error: error.response?.data?.message || 'Could not load billing plan'
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    fetchPlan();
  }, [fetchPlan]);

  return useMemo(() => {
    const limits = state.planLimits || state.limits || {};
    return {
      ...state,
      limits,
      canAccess: (feature) => {
        const value = limits[feature];
        if (typeof value === 'number') return value < 0 || value > 0;
        return Boolean(value);
      },
      refetch: fetchPlan
    };
  }, [fetchPlan, state]);
};

export default usePlan;
