'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, ShoppingCart, Heart, User, LogOut, ShoppingBag } from 'lucide-react';
import { useWishlist } from '@/lib/stores/wishlistStore';
import { useUserStore } from '@/lib/stores/userStore';
import { useCartStore } from '@/lib/stores/cartStore';
import { useAuthModal } from '@/components/auth/AuthModalProvider';
import { AuthModal } from '@/components/auth/AuthModal';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignupForm } from '@/components/auth/SignupForm';

import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { count } = useWishlist();
  const { user, isAuthenticated, setUser, logout } = useUserStore();

  const totalItems = useCartStore((state) => state.getTotalItems());
  const loadCart = useCartStore((state) => state.loadCart);
  const resetCart = useCartStore((state) => state.resetCart);

  const { authModal, setAuthModal } = useAuthModal();

  // Hydration fix + Load user from localStorage
  useEffect(() => {
    setMounted(true);

    // Try to load user from localStorage on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser && !user) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        // If fail, ensure loading stops
        useUserStore.setState({ isLoading: false });
      }
    } else if (!storedUser && !user) {
      // No user found, stop loading
      useUserStore.setState({ isLoading: false });
    }

    // Check URL params for login action
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'login' || params.get('login') === 'true') {
        setAuthModal('login');
        // Optional: Clean URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }
  }, [user, setUser, setAuthModal]);

  // Sync cart with auth state
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      resetCart();
    }
  }, [isAuthenticated, loadCart, resetCart]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const isActive = (path: string) => pathname === path || (path !== '/' && pathname?.startsWith(path));

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <div className="text-2xl font-bold text-primary">Jual.in</div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {(!isAuthenticated || user?.role !== 'merchant') && (
              <Link
                href="/shop"
                className={`text-sm font-medium transition-colors ${isActive('/shop') ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}
              >
                Shop
              </Link>
            )}
            {isAuthenticated && user?.role === 'merchant' && (
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${isActive('/dashboard') ? 'text-primary' : 'text-gray-700 hover:text-primary'}`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            {mounted && isAuthenticated ? (
              <>
                {/* Shopping Cart */}
                <Link href="/cart" className="relative">
                  <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-primary transition" />
                  {isAuthenticated && (
                    <span className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>

                {/* User Menu */}
                <div className="relative group">
                  <button className="text-gray-700 hover:text-primary transition flex items-center gap-2 py-2">
                    <User className="w-6 h-6" />
                    <span className="hidden md:inline text-sm text-gray-700 font-medium">{user?.name}</span>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right z-50">
                    <div className="px-4 py-2 border-b border-gray-100 mb-1 md:hidden">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                    </div>
                    <Link href="/profile" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                      <User className="w-4 h-4" /> Profile
                    </Link>
                    <Link href="/orders" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                      <ShoppingBag className="w-4 h-4" /> Orders
                    </Link>
                    <Link href="/wishlist" className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors">
                      <Heart className="w-4 h-4" /> Wishlist
                    </Link>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        resetCart();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Login/Register Buttons */}
                <button
                  onClick={() => setAuthModal('login')}
                  className="hidden md:block px-4 py-2 text-gray-700 hover:text-primary font-medium transition"
                >
                  Login
                </button>
                <button
                  onClick={() => setAuthModal('signup')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 font-medium transition"
                >
                  Sign Up
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden text-gray-700 hover:text-primary transition"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden pb-4 space-y-2">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 border-b border-gray-100 mb-2">
                  <p className="font-medium text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
                {user?.role === 'merchant' ? (
                  <Link
                    href="/dashboard"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard') ? 'text-primary' : 'text-gray-700 hover:text-primary hover:bg-gray-50'}`}
                    onClick={() => setIsOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/shop"
                    className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/shop') ? 'text-primary' : 'text-gray-700 hover:text-primary hover:bg-gray-50'}`}
                    onClick={() => setIsOpen(false)}
                  >
                    Shop
                  </Link>
                )}
                <Link
                  href="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Profile
                </Link>
                <Link
                  href="/orders"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Orders
                </Link>
                <Link
                  href="/wishlist"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Wishlist
                </Link>
                <button
                  onClick={() => {
                    logout();
                    resetCart();
                    setIsOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                {/* ... */}
                <button
                  onClick={() => {
                    setAuthModal('signup');
                    setIsOpen(false);
                  }}
                  className="w-full px-2 py-2 bg-primary text-primary-foreground rounded transition text-center"
                >
                  Sign Up
                </button>
              </>
            )}
          </nav>
        )}

        {/* Auth Modals */}
        <AuthModal
          isOpen={authModal === 'login'}
          onClose={() => setAuthModal(null)}
          title="Login to Jualin"
        >
          <LoginForm
            isModal={true}
            onSuccess={() => setAuthModal(null)}
            onSwitchToSignup={() => setAuthModal('signup')}
          />
        </AuthModal>

        <AuthModal
          isOpen={authModal === 'signup'}
          onClose={() => setAuthModal(null)}
          title="Create Account"
        >
          <SignupForm
            isModal={true}
            onSuccess={() => setAuthModal(null)}
            onSwitchToLogin={() => setAuthModal('login')}
          />
        </AuthModal>
      </div>
    </header>
  );
}
