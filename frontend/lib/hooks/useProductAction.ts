'use client';

import { useCallback } from 'react';
import { useUserStore } from '@/lib/stores/userStore';

interface UseProductActionOptions {
  onAuthRequired?: (type: 'login' | 'signup') => void;
}

/**
 * Hook untuk intercept product actions dan require authentication
 */
export function useProductAction(options?: UseProductActionOptions) {
  const { isAuthenticated } = useUserStore();

  const withAuthCheck = useCallback(
    (callback: () => void | Promise<void>, authType: 'login' | 'signup' = 'login') => {
      if (!isAuthenticated) {
        options?.onAuthRequired?.(authType);
        return;
      }
      callback();
    },
    [isAuthenticated, options]
  );

  return { withAuthCheck, isAuthenticated };
}
