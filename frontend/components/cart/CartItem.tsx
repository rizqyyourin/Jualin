'use client';

import { Trash2, Plus, Minus } from 'lucide-react';
import { CartItem as CartItemType } from '@/lib/CartContext';
import { Button } from '@/components/ui/button';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItemComponent({ item, onUpdateQuantity, onRemove }: CartItemProps) {
  return (
    <div className="flex gap-4 py-4 border-b last:border-b-0 sm:gap-6">
      {/* Product Image */}
      <div className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-gray-200 rounded-lg flex items-center justify-center">
        {item.image ? (
          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
        ) : (
          <div className="text-gray-400">No image</div>
        )}
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-gray-900 mb-1 truncate">{item.name}</h3>
        <p className="text-blue-600 font-bold text-lg">${item.price.toFixed(2)}</p>
      </div>

      {/* Quantity & Actions */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 sm:gap-4">
        {/* Quantity Selector */}
        <div className="flex items-center border rounded-lg">
          <button
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="px-2 py-1 hover:bg-gray-100 transition"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 py-1 font-semibold">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="px-2 py-1 hover:bg-gray-100 transition"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Subtotal */}
        <div className="text-right">
          <p className="text-xs text-gray-600 mb-1">Subtotal</p>
          <p className="text-lg font-bold text-gray-900">
            ${(item.price * item.quantity).toFixed(2)}
          </p>
        </div>

        {/* Remove Button */}
        <button
          onClick={onRemove}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
