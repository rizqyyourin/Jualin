<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // For SQLite, we need to recreate the table with the new enum values
        // For MySQL/PostgreSQL, we would use ALTER TABLE

        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            // SQLite doesn't support ALTER COLUMN, so we need to recreate the table
            DB::statement("
                CREATE TABLE orders_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    merchant_id INTEGER NOT NULL,
                    order_number VARCHAR NOT NULL UNIQUE,
                    status VARCHAR CHECK(status IN ('pending', 'confirmed', 'completed', 'processing', 'shipped', 'delivered', 'cancelled', 'refund')) DEFAULT 'pending',
                    payment_status VARCHAR CHECK(payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
                    shipping_status VARCHAR CHECK(shipping_status IN ('pending', 'shipped', 'in_transit', 'delivered')) DEFAULT 'pending',
                    subtotal DECIMAL(12, 2) DEFAULT 0,
                    shipping_cost DECIMAL(12, 2) DEFAULT 0,
                    tax DECIMAL(12, 2) DEFAULT 0,
                    discount_amount DECIMAL(12, 2) DEFAULT 0,
                    total_price DECIMAL(12, 2) DEFAULT 0,
                    payment_method VARCHAR,
                    shipping_method VARCHAR,
                    tracking_number VARCHAR,
                    shipping_address TEXT,
                    customer_notes TEXT,
                    admin_notes TEXT,
                    expires_at DATETIME,
                    shipped_at DATETIME,
                    delivered_at DATETIME,
                    cancelled_at DATETIME,
                    created_at DATETIME,
                    updated_at DATETIME,
                    deleted_at DATETIME,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (merchant_id) REFERENCES users(id) ON DELETE CASCADE
                )
            ");

            // Copy data from old table to new table
            DB::statement("
                INSERT INTO orders_new 
                SELECT * FROM orders
            ");

            // Drop old table
            DB::statement("DROP TABLE orders");

            // Rename new table to orders
            DB::statement("ALTER TABLE orders_new RENAME TO orders");

            // Recreate indexes
            DB::statement("CREATE INDEX orders_user_id_index ON orders(user_id)");
            DB::statement("CREATE INDEX orders_merchant_id_index ON orders(merchant_id)");
            DB::statement("CREATE INDEX orders_order_number_index ON orders(order_number)");
            DB::statement("CREATE INDEX orders_status_index ON orders(status)");
            DB::statement("CREATE INDEX orders_payment_status_index ON orders(payment_status)");
            DB::statement("CREATE INDEX orders_created_at_index ON orders(created_at)");
        } else {
            // For MySQL/PostgreSQL
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'confirmed', 'completed', 'processing', 'shipped', 'delivered', 'cancelled', 'refund') DEFAULT 'pending'");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $driver = DB::getDriverName();

        if ($driver === 'sqlite') {
            // Recreate without 'completed'
            DB::statement("
                CREATE TABLE orders_new (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    merchant_id INTEGER NOT NULL,
                    order_number VARCHAR NOT NULL UNIQUE,
                    status VARCHAR CHECK(status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refund')) DEFAULT 'pending',
                    payment_status VARCHAR CHECK(payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
                    shipping_status VARCHAR CHECK(shipping_status IN ('pending', 'shipped', 'in_transit', 'delivered')) DEFAULT 'pending',
                    subtotal DECIMAL(12, 2) DEFAULT 0,
                    shipping_cost DECIMAL(12, 2) DEFAULT 0,
                    tax DECIMAL(12, 2) DEFAULT 0,
                    discount_amount DECIMAL(12, 2) DEFAULT 0,
                    total_price DECIMAL(12, 2) DEFAULT 0,
                    payment_method VARCHAR,
                    shipping_method VARCHAR,
                    tracking_number VARCHAR,
                    shipping_address TEXT,
                    customer_notes TEXT,
                    admin_notes TEXT,
                    expires_at DATETIME,
                    shipped_at DATETIME,
                    delivered_at DATETIME,
                    cancelled_at DATETIME,
                    created_at DATETIME,
                    updated_at DATETIME,
                    deleted_at DATETIME,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
                    FOREIGN KEY (merchant_id) REFERENCES users(id) ON DELETE CASCADE
                )
            ");

            DB::statement("INSERT INTO orders_new SELECT * FROM orders WHERE status != 'completed'");
            DB::statement("DROP TABLE orders");
            DB::statement("ALTER TABLE orders_new RENAME TO orders");

            // Recreate indexes
            DB::statement("CREATE INDEX orders_user_id_index ON orders(user_id)");
            DB::statement("CREATE INDEX orders_merchant_id_index ON orders(merchant_id)");
            DB::statement("CREATE INDEX orders_order_number_index ON orders(order_number)");
            DB::statement("CREATE INDEX orders_status_index ON orders(status)");
            DB::statement("CREATE INDEX orders_payment_status_index ON orders(payment_status)");
            DB::statement("CREATE INDEX orders_created_at_index ON orders(created_at)");
        } else {
            DB::statement("ALTER TABLE orders MODIFY COLUMN status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refund') DEFAULT 'pending'");
        }
    }
};
