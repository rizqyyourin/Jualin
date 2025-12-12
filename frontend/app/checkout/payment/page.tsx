'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckoutProgress } from '@/components/checkout/CheckoutProgress';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCartStore } from '@/lib/stores/cartStore';
import { CreditCard, Smartphone, DollarSign, ChevronRight } from 'lucide-react';

export default function PaymentPage() {
  const { getTotalPrice } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [cardData, setCardData] = useState({
    cardName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const method = localStorage.getItem('shippingMethod');
    if (method) setShippingMethod(method);
  }, [isMounted]);

  const subtotal = Number(getTotalPrice());
  const shippingMethods: Record<string, number> = {
    standard: 10,
    express: 25,
    overnight: 50,
  };
  const shippingCost = subtotal > 100 ? 0 : (shippingMethods[shippingMethod] || 10);
  const tax = subtotal * 0.1;
  const total = subtotal + shippingCost + tax;

  const steps = [
    { number: 1, label: 'Shipping', completed: true, current: false },
    { number: 2, label: 'Payment', completed: false, current: true },
    { number: 3, label: 'Review', completed: false, current: false },
    { number: 4, label: 'Confirmation', completed: false, current: false },
  ];

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').slice(0, 16);
      formattedValue = formattedValue.replace(/(\d{4})/g, '$1 ').trim();
    } else if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
      if (formattedValue.length >= 2) {
        formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2);
      }
    } else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setCardData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Store payment data in localStorage for next step
    localStorage.setItem('paymentMethod', paymentMethod);
    if (paymentMethod === 'card') {
      localStorage.setItem('cardData', JSON.stringify(cardData));
    }
    // Navigate to review
    window.location.href = '/checkout/review';
  };

  const isCardValid =
    paymentMethod !== 'card' ||
    (cardData.cardName &&
      cardData.cardNumber.replace(/\s/g, '').length === 16 &&
      cardData.expiryDate.length === 5 &&
      cardData.cvv.length === 3);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress */}
        <CheckoutProgress steps={steps} />

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card className="p-6 sm:p-8">
              <h1 className="text-2xl font-bold mb-8">Payment Method</h1>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Credit Card Option */}
                <label className={`flex items-start p-6 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'card' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-blue-600 mt-1"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      <p className="font-bold text-gray-900">Credit or Debit Card</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Visa, Mastercard, or American Express
                    </p>
                  </div>
                </label>

                {/* Credit Card Form */}
                {paymentMethod === 'card' && (
                  <div className="space-y-4 p-6 bg-primary/5 rounded-lg border border-primary/20">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cardholder Name
                      </label>
                      <Input
                        type="text"
                        name="cardName"
                        value={cardData.cardName}
                        onChange={handleCardChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Card Number
                      </label>
                      <Input
                        type="text"
                        name="cardNumber"
                        value={cardData.cardNumber}
                        onChange={handleCardChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Expiry Date
                        </label>
                        <Input
                          type="text"
                          name="expiryDate"
                          value={cardData.expiryDate}
                          onChange={handleCardChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          CVV
                        </label>
                        <Input
                          type="text"
                          name="cvv"
                          value={cardData.cvv}
                          onChange={handleCardChange}
                          placeholder="123"
                          maxLength={3}
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* PayPal Option */}
                <label className={`flex items-start p-6 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'paypal' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={paymentMethod === 'paypal'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-blue-600 mt-1"
                  />
                  <div className="ml-4 flex-1">
                    <p className="font-bold text-gray-900 mb-1">PayPal</p>
                    <p className="text-sm text-gray-600">
                      Fast, secure, and convenient
                    </p>
                  </div>
                </label>

                {/* Apple Pay Option */}
                <label className={`flex items-start p-6 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'applepay' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="applepay"
                    checked={paymentMethod === 'applepay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-blue-600 mt-1"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="w-5 h-5 text-primary" />
                      <p className="font-bold text-gray-900">Apple Pay</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Quick and secure payment with your Apple device
                    </p>
                  </div>
                </label>

                {/* Google Pay Option */}
                <label className={`flex items-start p-6 border-2 rounded-lg cursor-pointer transition ${paymentMethod === 'googlepay' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="googlepay"
                    checked={paymentMethod === 'googlepay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-5 h-5 text-blue-600 mt-1"
                  />
                  <div className="ml-4 flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Smartphone className="w-5 h-5 text-primary" />
                      <p className="font-bold text-gray-900">Google Pay</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Fast checkout with your Google account
                    </p>
                  </div>
                </label>

                {/* Form Actions */}
                <div className="flex gap-4 pt-6 border-t">
                  <Link href="/checkout/shipping" className="flex-1">
                    <Button variant="outline" className="w-full">
                      Back to Shipping
                    </Button>
                  </Link>
                  <button
                    type="submit"
                    disabled={!isCardValid}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:bg-gray-400 text-primary-foreground font-semibold py-3 rounded-lg transition"
                  >
                    Review Order
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="p-6 sticky top-20 space-y-4">
              <h2 className="font-bold text-lg">Order Summary</h2>

              <div className="space-y-2 pb-4 border-b">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {subtotal > 100 ? 'Shipping (Free)' : 'Shipping'}
                  </span>
                  <span>${shippingCost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tax (10%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  ${total.toFixed(2)}
                </span>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  ✓ Your payment is secure and encrypted
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
