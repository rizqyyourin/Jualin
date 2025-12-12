'use client';

import { Heart } from 'lucide-react';
import { useWishlist } from '@/lib/stores/wishlistStore';
import { useNotifications } from '@/lib/stores/notificationStore';
import { useUserStore } from '@/lib/stores/userStore';
import { useAuthModal } from '@/components/auth/AuthModalProvider';
import { WishlistItem } from '@/lib/stores/wishlistStore';

interface WishlistButtonProps {
  item: WishlistItem;
  className?: string;
  variant?: 'default' | 'rounded' | 'minimal';
  showLabel?: boolean;
}

export const WishlistButton = ({
  item,
  className = '',
  variant = 'default',
  showLabel = false,
}: WishlistButtonProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { success } = useNotifications();
  const { isAuthenticated } = useUserStore();
  const { openLoginModal } = useAuthModal();

  const inWishlist = isInWishlist(item.id);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      openLoginModal();
      return;
    }

    if (inWishlist) {
      removeFromWishlist(item.id);
      success('Removed from wishlist');
    } else {
      addToWishlist(item);
      success('Added to wishlist');
    }
  };

  const baseClasses = 'transition-all duration-200';

  if (variant === 'rounded') {
    return (
      <button
        onClick={handleToggle}
        className={`p-2 rounded-full ${
          inWishlist
            ? 'bg-red-100 text-red-500 hover:bg-red-200'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } ${baseClasses} ${className}`}
        title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          size={20}
          className={inWishlist ? 'fill-current' : ''}
        />
      </button>
    );
  }

  if (variant === 'minimal') {
    return (
      <button
        onClick={handleToggle}
        className={`${
          inWishlist ? 'text-red-500' : 'text-gray-600 hover:text-red-500'
        } ${baseClasses} ${className}`}
        title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        <Heart
          size={24}
          className={inWishlist ? 'fill-current' : ''}
        />
      </button>
    );
  }

  // Default variant - with label
  return (
    <button
      onClick={handleToggle}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all ${
        inWishlist
          ? 'border-red-500 bg-red-50 text-red-500 hover:bg-red-100'
          : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500 hover:bg-red-50'
      } ${baseClasses} ${className}`}
    >
      <Heart
        size={20}
        className={inWishlist ? 'fill-current' : ''}
      />
      {showLabel && (
        <span className="font-medium">
          {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
        </span>
      )}
    </button>
  );
};
