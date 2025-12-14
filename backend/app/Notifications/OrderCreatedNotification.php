<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderCreatedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    protected $order;

    /**
     * Create a new notification instance.
     */
    public function __construct(Order $order)
    {
        $this->order = $order;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        // Use database for in-app notifications
        // Add 'mail' if email is configured
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New Order Received - ' . $this->order->order_number)
            ->greeting('Hello ' . $notifiable->name . '!')
            ->line('You have received a new order.')
            ->line('Order Number: ' . $this->order->order_number)
            ->line('Total Amount: Rp ' . number_format((float) $this->order->total_price, 0, ',', '.'))
            ->line('Customer: ' . $this->order->customer->name)
            ->action('View Order Details', url('/dashboard/orders/' . $this->order->id))
            ->line('Please confirm the order as soon as possible.');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'order_id' => $this->order->id,
            'order_number' => $this->order->order_number,
            'total_price' => $this->order->total_price,
            'customer_name' => $this->order->customer->name,
            'items_count' => $this->order->items->count(),
            'message' => 'New order received: ' . $this->order->order_number,
        ];
    }
}
