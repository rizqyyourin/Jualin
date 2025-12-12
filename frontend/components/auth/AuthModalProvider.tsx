'use client';

import React, { createContext, useContext, useState } from 'react';

type AuthModalType = 'login' | 'signup' | null;

interface AuthModalContextType {
  authModal: AuthModalType;
  setAuthModal: (modal: AuthModalType) => void;
  openLoginModal: () => void;
  openSignupModal: () => void;
  closeAuthModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [authModal, setAuthModal] = useState<AuthModalType>(null);

  const value: AuthModalContextType = {
    authModal,
    setAuthModal,
    openLoginModal: () => setAuthModal('login'),
    openSignupModal: () => setAuthModal('signup'),
    closeAuthModal: () => setAuthModal(null),
  };

  return (
    <AuthModalContext.Provider value={value}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within AuthModalProvider');
  }
  return context;
}
