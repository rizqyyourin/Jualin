'use client';

import { Card } from '@/components/ui/card';
import { Package, Truck, MapPin, CheckCircle, Clock } from 'lucide-react';

export interface OrderTrackingStep {
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  title: string;
  description: string;
  timestamp?: string;
  completed: boolean;
}

interface OrderTrackingTimelineProps {
  steps: OrderTrackingStep[];
  currentStatus: 'pending' | 'processing' | 'shipped' | 'delivered';
}

export const OrderTrackingTimeline = ({
  steps,
  currentStatus,
}: OrderTrackingTimelineProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />;
      case 'processing':
        return <Package className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string, completed: boolean) => {
    if (completed) {
      return 'bg-green-500 text-white';
    }

    switch (status) {
      case 'processing':
        return 'bg-blue-500 text-white';
      case 'shipped':
        return 'bg-purple-500 text-white';
      case 'pending':
      default:
        return 'bg-gray-300 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Timeline */}
      <div className="relative">
        {steps.map((step, index) => {
          const isCompleted = step.completed;
          const isLast = index === steps.length - 1;

          return (
            <div key={step.status} className="relative flex gap-4 pb-6">
              {/* Connector Line */}
              {!isLast && (
                <div className="absolute left-6 top-14 w-1 h-12 bg-gradient-to-b from-green-500 to-gray-300" />
              )}

              {/* Timeline Dot */}
              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(step.status, isCompleted)}`}>
                {getStatusIcon(step.status)}
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-semibold text-gray-900">{step.title}</h4>
                  {step.timestamp && (
                    <span className="text-sm text-gray-500">{step.timestamp}</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface OrderTrackingCardProps {
  orderId: string;
  currentStatus: 'pending' | 'processing' | 'shipped' | 'delivered';
  estimatedDelivery?: string;
  trackingNumber?: string;
}

export const OrderTrackingCard = ({
  orderId,
  currentStatus,
  estimatedDelivery,
  trackingNumber,
}: OrderTrackingCardProps) => {
  // Generate tracking steps based on current status
  const getTrackingSteps = (status: string): OrderTrackingStep[] => {
    const baseSteps: OrderTrackingStep[] = [
      {
        status: 'pending',
        title: 'Order Placed',
        description: 'Your order has been confirmed and is being processed',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        completed: true,
      },
      {
        status: 'processing',
        title: 'Processing',
        description: 'Your items are being packed and prepared for shipment',
        timestamp:
          ['processing', 'shipped', 'delivered'].includes(status)
            ? new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toLocaleDateString()
            : undefined,
        completed: ['processing', 'shipped', 'delivered'].includes(status),
      },
      {
        status: 'shipped',
        title: 'Shipped',
        description: 'Your order has been dispatched and is on its way',
        timestamp:
          ['shipped', 'delivered'].includes(status)
            ? new Date(Date.now()).toLocaleDateString()
            : undefined,
        completed: ['shipped', 'delivered'].includes(status),
      },
      {
        status: 'delivered',
        title: 'Delivered',
        description: 'Your order has been delivered',
        timestamp:
          status === 'delivered'
            ? new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()
            : undefined,
        completed: status === 'delivered',
      },
    ];

    return baseSteps;
  };

  const steps = getTrackingSteps(currentStatus);

  const statusMessages: Record<string, string> = {
    pending: 'Your order is being prepared',
    processing: 'Your order is being packed',
    shipped: 'Your order is on its way to you',
    delivered: 'Your order has been delivered',
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-50 border-yellow-200',
    processing: 'bg-blue-50 border-blue-200',
    shipped: 'bg-purple-50 border-purple-200',
    delivered: 'bg-green-50 border-green-200',
  };

  const statusBadgeColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
  };

  return (
    <Card className={`border-2 p-6 ${statusColors[currentStatus]}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Order Tracking</h3>
          <p className="text-sm text-gray-600">Order #{orderId}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-semibold capitalize ${statusBadgeColors[currentStatus]}`}>
          {currentStatus}
        </span>
      </div>

      {/* Status Message */}
      <div className="bg-white/50 rounded-lg p-4 mb-6">
        <p className="text-gray-900 font-semibold">{statusMessages[currentStatus]}</p>
        {estimatedDelivery && currentStatus !== 'delivered' && (
          <p className="text-sm text-gray-600 mt-2">
            Expected delivery: <span className="font-semibold">{estimatedDelivery}</span>
          </p>
        )}
      </div>

      {/* Tracking Number */}
      {trackingNumber && (
        <div className="mb-6 pb-6 border-b border-white/30">
          <p className="text-sm text-gray-600 mb-1">Tracking Number</p>
          <p className="font-mono text-lg font-bold text-gray-900">{trackingNumber}</p>
        </div>
      )}

      {/* Timeline */}
      <OrderTrackingTimeline steps={steps} currentStatus={currentStatus as any} />
    </Card>
  );
};
