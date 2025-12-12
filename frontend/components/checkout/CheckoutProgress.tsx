'use client';

import { Check } from 'lucide-react';

interface CheckoutStep {
  number: number;
  label: string;
  completed: boolean;
  current: boolean;
}

interface CheckoutProgressProps {
  steps: CheckoutStep[];
}

export function CheckoutProgress({ steps }: CheckoutProgressProps) {
  return (
    <div className="mb-12">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            {/* Step Circle */}
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold text-sm transition ${
                step.completed
                  ? 'bg-green-500 text-white'
                  : step.current
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step.completed ? <Check className="w-5 h-5" /> : step.number}
            </div>

            {/* Label */}
            <p
              className={`ml-3 font-semibold transition ${
                step.current
                  ? 'text-blue-600'
                  : step.completed
                    ? 'text-green-600'
                    : 'text-gray-600'
              }`}
            >
              {step.label}
            </p>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 transition ${
                  step.completed ? 'bg-green-500' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
