# Jualin Backend - Laravel REST API

Backend untuk aplikasi e-commerce SaaS **Jualin** yang dibangun menggunakan Laravel framework.

## 📋 Deskripsi Proyek

Jualin adalah platform e-commerce SaaS yang dirancang untuk memudahkan penjual dalam mengelola toko online mereka. Backend ini menyediakan REST API yang komprehensif untuk mendukung semua operasi bisnis.

## 🚀 Teknologi yang Digunakan

- **Framework**: Laravel 12.42.0
- **PHP**: 8.3+
- **Database**: SQLite (Development), dapat dipindahkan ke PostgreSQL/MySQL
- **Package Manager**: Composer
- **Testing**: PHPUnit
- **Code Style**: Laravel Pint

## 📦 Instalasi & Setup

### Prerequisites
- PHP 8.3 atau lebih tinggi
- Composer
- Git

### Langkah Instalasi

1. Clone atau ekstrak repository ini
2. Instal dependencies:
   ```bash
   composer install
   ```

3. Generate application key:
   ```bash
   php artisan key:generate
   ```

4. Setup database:
   ```bash
   php artisan migrate
   ```

5. Jalankan server development:
   ```bash
   php artisan serve
   ```

Server akan berjalan di `http://localhost:8000`

## 📑 Progress Development

### Phase 1: Project Setup ✅ COMPLETED
- [x] Inisialisasi Laravel project (v12.42.0)
- [x] Setup dependencies dasar dengan Composer
- [x] Konfigurasi database (SQLite)
- [x] Migrasi default (users, cache, jobs)
- [x] Environment configuration (.env setup)
- [x] Generate application key
- [x] Database migrations ready

### Phase 2: Authentication & Authorization ✅ COMPLETED
- [x] Setup Laravel Sanctum untuk API authentication
- [x] User model dengan relasi roles/permissions
- [x] Email verification & verification emails
- [x] Password reset functionality
- [x] Login & register endpoints
- [x] Token refresh mechanism
- [x] Authorization middleware per role (merchant/customer/admin)
- [x] Multi-tenant setup untuk merchant isolation
- [x] **Comprehensive Testing** (15 feature tests + 11 unit tests = 26 tests)
  - [x] User registration validation (merchant & customer)
  - [x] Login validation & error handling
  - [x] Token management (generate, refresh, logout)
  - [x] Profile management
  - [x] User model relationships & methods
  - [x] Password hashing & security

### Phase 3: Core Data Models ✅ COMPLETED
- [x] User & UserProfile Models (from Phase 2, extended)
- [x] Category Model dengan relasi ke User (merchant)
- [x] Product Model dengan relationships (Category, User, Images, Stock, Orders, Reviews)
- [x] ProductImage Model untuk multiple images per product
- [x] Stock Model dengan inventory tracking
- [x] StockHistory Model untuk audit trail stock movements
- [x] Order Model dengan status workflow & multi-tenant support
- [x] OrderItem Model untuk line items dalam order
- [x] OrderStatusHistory Model untuk audit trail order changes
- [x] CustomerAddress Model untuk multiple addresses per customer
- [x] Review Model untuk product reviews dengan approval workflow
- [x] Create semua database migrations (15 total)
- [x] **Comprehensive Testing** (12 feature tests = 12 tests)
  - [x] Category creation dengan merchant validation
  - [x] Product creation dengan attributes & casts
  - [x] Product images management
  - [x] Stock management & calculations
  - [x] StockHistory tracking dengan reason
  - [x] Order creation dengan multi-tenant
  - [x] OrderItem management dengan price freezing
  - [x] OrderStatusHistory audit trail
  - [x] CustomerAddress dengan default handling
  - [x] Review management dengan approval
  - [x] Final price calculation dengan discount
  - [x] Order number uniqueness validation

#### Models Created:
- **Category**: Merchant's product categories
- **Product**: Main product model dengan 9 relationships
- **ProductImage**: Multiple images per product
- **Stock**: Inventory tracking per product
- **StockHistory**: Complete stock movement audit trail
- **Order**: Customer orders dengan multi-merchant support
- **OrderItem**: Order line items dengan price history
- **OrderStatusHistory**: Order status change tracking
- **CustomerAddress**: Multiple addresses per customer
- **Review**: Product reviews dengan approval workflow

#### Database Migrations:
- 15 total migrations successfully applied
- All relationships properly defined dengan foreign keys
- JSON columns untuk flexible data (shipping_address, images)
- Enums untuk status fields (pending, confirmed, shipped, etc)
- Soft deletes untuk data integrity

### Phase 3.2: Core Data Models - API Endpoints ✅ COMPLETED
- [x] ProductController CRUD endpoints (index, show, store, update, destroy)
- [x] Product image upload endpoints (uploadImages, deleteImage)
- [x] CategoryController CRUD endpoints (index, show, store, update, destroy)
- [x] OrderController untuk order management & status updates (complete workflow)
- [x] CustomerAddressController CRUD endpoints (full address management)
- [x] ReviewController untuk reviews management (create, approve, reject, helpful)
- [x] Update routes di /routes/api.php dengan 65+ endpoints
- [x] Feature tests untuk semua endpoints (30 passing tests)
- [x] Authorization checks per resource ownership
- [x] Policy files created (ProductPolicy, CategoryPolicy)

**Test Results: ✅ 70/70 TESTS PASSING (100% - 214 assertions)**
- Phase 3.2 Endpoints: 30/30 ✅
- Phase 3 Models: 12/12 ✅
- Phase 2 Auth: 15/15 ✅
- User Tests: 11/11 ✅
- Other Tests: 2/2 ✅

### Phase 4: Advanced Commerce Features ✅ COMPLETED
- [x] Cart management endpoints & business logic (6 endpoints)
  - [x] Get user's cart with items & totals
  - [x] Add item to cart with duplicate detection
  - [x] Update cart item quantity
  - [x] Remove item from cart
  - [x] Clear entire cart
  - [x] Apply discount to cart
- [x] Wishlist/favorite products endpoints (4 endpoints)
  - [x] Get user's wishlist
  - [x] Add product to wishlist with duplicate prevention
  - [x] Remove product from wishlist
  - [x] Check if product is in wishlist
- [x] Payment initiation endpoints (6 endpoints)
  - [x] Create payment for order
  - [x] Get payment details
  - [x] Get payment by order
  - [x] Confirm payment (simulate payment gateway)
  - [x] Fail payment
  - [x] Refund payment
- [x] Shipping cost calculation (6 endpoints)
  - [x] Get merchant's shipping methods
  - [x] Create shipping method (flat/weight-based/distance-based)
  - [x] Get shipping method details
  - [x] Update shipping method
  - [x] Delete shipping method
  - [x] Calculate shipping cost with dynamic pricing
- [x] Merchant analytics endpoints (5 endpoints)
  - [x] Dashboard overview metrics (today/this month/total)
  - [x] Sales analytics with period filtering (daily/weekly/monthly)
  - [x] Top products performance
  - [x] Customer insights (total, returning, avg order value, top customers)
  - [x] Record daily analytics data
- [x] Admin management endpoints (7 endpoints)
  - [x] List all users with filtering (role/status/search)
  - [x] Get user details
  - [x] Update user status (active/inactive)
  - [x] Update user role (merchant/customer/admin)
  - [x] Delete user (soft delete)
  - [x] Get platform statistics
  - [x] Search products by merchant
- [x] Create Cart, CartItem, Wishlist, Payment, ShippingMethod, MerchantAnalytic models
- [x] Update routes dengan 40+ Phase 4 endpoints
- [x] **Comprehensive Testing** (39 feature tests untuk Phase 4)
  - [x] Cart functionality (6 tests)
  - [x] Wishlist management (5 tests)
  - [x] Payment processing (7 tests)
  - [x] Shipping methods (6 tests)
  - [x] Merchant analytics (6 tests)
  - [x] Admin management (9 tests)

**Test Results: ✅ 109/109 TESTS PASSING (100% - 324 assertions)**
- Phase 4 Endpoints: 39/39 ✅
- Phase 3.2 Endpoints: 30/30 ✅
- Phase 3 Models: 12/12 ✅
- Phase 2 Auth: 15/15 ✅
- User Tests: 11/11 ✅
- Other Tests: 2/2 ✅

### Phase 5: Business Logic & Services ✅ COMPLETED
- [x] Order creation & cart to order conversion with transaction safety
- [x] Automatic stock deduction on order with rollback on failure
- [x] Order status workflow (pending → confirmed → shipped → delivered)
- [x] Inventory management & stock alerts with StockHistory audit trail
- [x] Payment processing & verification with refund support
- [x] Automatic invoice generation with auto-numbering (INV-YYYYMMDD-######)
- [x] Coupon & discount calculation with max limit enforcement
- [x] Coupon usage tracking & counter management
- [x] Transaction logging for complete audit trail
- [x] 6 Service classes (CartService, StockService, CouponService, OrderService, InvoiceService, PaymentService)
- [x] 4 Models (Coupon, CouponUsage, Invoice, TransactionLog)
- [x] 7 Database migrations for Phase 5 features
- [x] 30 Comprehensive tests in OrderManagementTest.php - all passing
- [x] **Comprehensive Testing** (30 feature tests untuk Phase 5)
  - [x] Cart operations (add, update, remove, clear - 5 tests)
  - [x] Coupon validation & application (5 tests)
  - [x] Stock management & deduction (2 tests)
  - [x] Order creation & workflow (6 tests)
  - [x] Order status transitions (confirm, ship, deliver, cancel - 4 tests)
  - [x] Invoice generation & totals (2 tests)
  - [x] Payment processing & refunds (3 tests)
  - [x] Transaction logging (2 tests)
  - [x] Coupon usage tracking & revocation (2 tests)
  - [x] Order filtering & queries (2 tests)

**Test Results: ✅ 139/139 TESTS PASSING (100% - 392 assertions)**
- Phase 5 Services: 30/30 ✅
- Phase 4 Endpoints: 39/39 ✅
- Phase 3.2 Endpoints: 30/30 ✅
- Phase 3 Models: 12/12 ✅
- Phase 2 Auth: 15/15 ✅
- User Tests: 11/11 ✅
- Other Tests: 2/2 ✅

### Phase 6: Testing & Documentation ✅ COMPLETED
- [x] Custom exception classes (ApiException, ValidationException, ResourceNotFoundException, UnauthorizedException, ForbiddenException, BusinessLogicException)
- [x] Form request validators (LoginRequest, RegisterRequest, StoreCouponRequest, UpdateCouponRequest, ApplyCouponRequest, CreateOrderRequest)
- [x] Unit tests untuk models (Coupon, Invoice, TransactionLog)
- [x] Database factories untuk semua models (User, Category, Product, Coupon, Invoice, Order, TransactionLog)
- [x] Error handling dengan consistent JSON responses
- [x] Request/Response validation dengan custom error messages
- [x] **Comprehensive Testing** (26 unit tests untuk Phase 6 models)
  - [x] Coupon validation tests (5 tests)
  - [x] Coupon discount calculation (3 tests)
  - [x] Invoice generation & numbering (7 tests)
  - [x] Invoice status workflow (1 test)
  - [x] TransactionLog tracking (7 tests)
  - [x] Factory creation tests (all models)

**Test Results: ✅ 166/166 TESTS PASSING (100% - 435 assertions)**
- Phase 6 Unit Tests: 26/26 ✅
- Phase 5 Services: 30/30 ✅
- Phase 4 Endpoints: 39/39 ✅
- Phase 3.2 Endpoints: 30/30 ✅
- Phase 3 Models: 12/12 ✅
- Phase 2 Auth: 15/15 ✅
- User Tests: 11/11 ✅
- Other Tests: 3/3 ✅

### Phase 7: Deployment & Production (Planned)
- [ ] Database migration strategy (SQLite → PostgreSQL/MySQL)
- [ ] Production environment setup
- [ ] Security hardening (HTTPS, CORS, rate limiting)
- [ ] Environment variables management
- [ ] Database backup & recovery procedures
- [ ] Monitoring & error tracking (Sentry)
- [ ] Logging aggregation
- [ ] CI/CD pipeline setup (GitHub Actions/GitLab)
- [ ] Health check endpoints
- [ ] API versioning strategy

## 📁 Project Structure

```
backend/
├── app/
│   ├── Models/          # Database models
│   ├── Controllers/     # API controllers
│   ├── Requests/        # Form request validation
│   └── Services/        # Business logic layer
├── database/
│   ├── migrations/      # Database migrations
│   └── seeders/         # Database seeders
├── routes/
│   └── api.php          # API routes definition
├── config/              # Configuration files
├── tests/               # Unit & feature tests
├── .env                 # Environment variables
└── README.md            # File ini
```

## 🔗 API Endpoints

### Authentication
```
POST   /api/auth/register           - Register user (merchant/customer)
POST   /api/auth/login              - Login & get JWT token
POST   /api/auth/logout             - Logout
POST   /api/auth/refresh            - Refresh access token
GET    /api/auth/me                 - Get current user profile
POST   /api/auth/forgot-password    - Request password reset
POST   /api/auth/reset-password     - Reset password with token
```

### Products (Merchant Only)
```
GET    /api/products                - List products with filters
GET    /api/products/{id}           - Get product details
POST   /api/products                - Create new product
PUT    /api/products/{id}           - Update product
DELETE /api/products/{id}           - Delete product
POST   /api/products/{id}/images    - Upload product images
DELETE /api/products/{id}/images/{imageId} - Delete product image
```

### Categories (Merchant Only)
```
GET    /api/categories              - List categories
POST   /api/categories              - Create category
PUT    /api/categories/{id}         - Update category
DELETE /api/categories/{id}         - Delete category
```

### Orders (Customer & Merchant)
```
POST   /api/orders                  - Create new order
GET    /api/orders                  - List user's orders
GET    /api/orders/{id}             - Get order details
PUT    /api/orders/{id}/cancel      - Cancel order
GET    /api/orders/{id}/tracking    - Get tracking info
PUT    /api/orders/{id}/status      - Update order status (merchant)
```

### Cart
```
GET    /api/cart                    - Get user's shopping cart
POST   /api/cart/items              - Add item to cart
PUT    /api/cart/items/{itemId}     - Update cart item quantity
DELETE /api/cart/items/{itemId}     - Remove item from cart
DELETE /api/cart                    - Clear cart
POST   /api/cart/discount           - Apply discount to cart
```

### Wishlist (Phase 4)
```
GET    /api/wishlist                - Get user's wishlist items
POST   /api/wishlist                - Add product to wishlist
DELETE /api/wishlist/{id}           - Remove product from wishlist
POST   /api/wishlist/check          - Check if product in wishlist
```

### Payments (Phase 4)
```
POST   /api/payments                - Create payment for order
GET    /api/payments/{id}           - Get payment details
GET    /api/orders/{orderId}/payment - Get payment by order
POST   /api/payments/{id}/confirm   - Confirm payment success
POST   /api/payments/{id}/fail      - Mark payment as failed
POST   /api/payments/{id}/refund    - Refund payment
```

### Shipping (Phase 4)
```
GET    /api/shipping-methods        - Get merchant's shipping methods
POST   /api/shipping-methods        - Create shipping method
GET    /api/shipping-methods/{id}   - Get shipping method details
PUT    /api/shipping-methods/{id}   - Update shipping method
DELETE /api/shipping-methods/{id}   - Delete shipping method
POST   /api/shipping-methods/{id}/calculate - Calculate shipping cost
```

### Customer Management
```
GET    /api/customers/profile       - Get customer profile
PUT    /api/customers/profile       - Update customer profile
GET    /api/addresses               - List customer addresses
POST   /api/addresses               - Add new address
PUT    /api/addresses/{id}          - Update address
DELETE /api/addresses/{id}          - Delete address
GET    /api/orders                  - Get order history
```

### Reviews & Ratings
```
GET    /api/products/{id}/reviews   - Get product reviews
POST   /api/reviews                 - Create product review
```

### Merchant Analytics (Phase 4)
```
GET    /api/analytics/dashboard     - Dashboard overview metrics
GET    /api/analytics/sales         - Sales analytics (daily/weekly/monthly)
GET    /api/analytics/top-products  - Top products performance
GET    /api/analytics/customers     - Customer insights
POST   /api/analytics/record-daily  - Record daily analytics data
```

### Admin Management (Phase 4)
```
GET    /api/admin/users             - List all users with filtering
GET    /api/admin/users/{id}        - Get user details
PUT    /api/admin/users/{id}/status - Update user status
PUT    /api/admin/users/{id}/role   - Update user role
DELETE /api/admin/users/{id}        - Delete user (soft delete)
GET    /api/admin/statistics        - Get platform statistics
GET    /api/admin/products          - Search products by merchant
```

## 🗂️ Database Schema (SQLite)

### **User Management**
- `users` - User accounts (merchant/customer/admin)
- `user_profiles` - Extended user profile & shop info

### **Product Management**
- `categories` - Product categories per merchant
- `products` - Product catalog with pricing & details
- `product_images` - Product images & media
- `product_variants` - Product variants (size, color, etc) - Optional for MVP+

### **Cart & Wishlist** (Phase 4)
- `carts` - User shopping carts with totals
- `cart_items` - Individual items in cart
- `wishlists` - User favorite products

### **Payment** (Phase 4)
- `payments` - Payment records & gateway info

### **Shipping** (Phase 4)
- `shipping_methods` - Merchant shipping configurations


### **Inventory**
- `stock` - Current product stock levels
- `stock_history` - Stock movement history & audit trail

### **Order Management**
- `orders` - Customer orders with status tracking
- `order_items` - Individual items in each order
- `order_status_history` - Order status change tracking

### **Payment**
- `payments` - Payment records & gateway info
- `invoices` - Invoice generation & tracking

### **Shipping**
- `shipping_methods` - Available shipping methods per merchant
- `shipments` - Shipment tracking information

### **Customer**
- `customer_addresses` - Customer saved addresses
- `reviews` - Product reviews & ratings

### **Promo & Discount**
- `coupons` - Coupon codes & tracking
- `promotions` - Store-wide & category promotions

### **Analytics & Logs**
- `transaction_logs` - Financial transaction tracking
- `merchant_analytics` - Daily sales analytics per merchant
- `activity_logs` - User activity audit trail

## 🧪 Testing

### Run All Tests
```bash
php artisan test
```

### Run Specific Test File
```bash
php artisan test tests/Feature/Feature/AuthTest.php
php artisan test tests/Feature/Unit/UserTest.php
```

### Test Coverage (Phase 2)
- ✅ **Feature Tests (15 tests)**
  - User registration with validation
  - User login with error handling
  - Token management (refresh, logout)
  - Profile retrieval
  - Authentication middleware

- ✅ **Unit Tests (11 tests)**
  - User model creation & relationships
  - Role methods (isMerchant, isCustomer, isAdmin)
  - Password hashing
  - API token generation
  - Soft delete functionality

**Total: 27 tests, all passing ✅**

## 🛡️ Error Handling & Validation (Phase 6)

### Custom Exception Classes
Semua exceptions mewarisi dari `ApiException` dengan JSON response yang konsisten:

```php
// ApiException - Base exception class
throw new \App\Exceptions\ApiException('Error message', 'ERROR_CODE', 500);

// ValidationException - Form validation errors (422)
throw new \App\Exceptions\ValidationException(['field' => 'error message']);

// ResourceNotFoundException - Resource not found (404)
throw new \App\Exceptions\ResourceNotFoundException('Product');

// UnauthorizedException - Authentication required (401)
throw new \App\Exceptions\UnauthorizedException('Please login first');

// ForbiddenException - Authorization failed (403)
throw new \App\Exceptions\ForbiddenException('You cannot access this resource');

// BusinessLogicException - Business rule violation (400)
throw new \App\Exceptions\BusinessLogicException('Stock tidak cukup', 'INSUFFICIENT_STOCK');
```

### Standard Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "errors": {
      "email": "Email is required",
      "password": "Password must be at least 6 characters"
    }
  }
}
```

### Form Request Validators (Phase 6)
Comprehensive validation untuk semua API endpoints:

- **LoginRequest** - Email & password validation
- **RegisterRequest** - User registration validation
- **StoreCouponRequest** - Coupon creation dengan date/value validation
- **UpdateCouponRequest** - Coupon update dengan unique code checking
- **ApplyCouponRequest** - Coupon code existence validation
- **CreateOrderRequest** - Order creation dengan payment method & address validation

Setiap validator memiliki custom error messages untuk user experience yang lebih baik.

Package yang akan digunakan:
- **laravel/sanctum** - API authentication & token management
- **intervention/image** - Image processing & optimization
- **midtrans/midtrans-php** - Payment gateway integration
- **darkaonline/l5-swagger** - API documentation
- **league/flysystem-aws-s3-v3** - Cloud storage (optional)
- **predis/predis** - Redis caching (optional)

## 🎯 Core Features (MVP)

### Authentication & Authorization
- [x] User registration (merchant/customer)
- [x] Login dengan JWT/Sanctum token
- [x] Email verification
- [x] Password reset
- [x] Role-based access control (merchant/customer/admin)
- [x] Merchant multi-tenant capability

### Product Management
- [ ] Product CRUD with images
- [ ] Category management
- [ ] Product search & filtering
- [ ] Product variants support
- [ ] Bulk product operations
- [ ] Stock tracking

### Order Management
- [ ] Shopping cart (database/session)
- [ ] Order creation
- [ ] Order status tracking
- [ ] Order history
- [ ] Order cancellation

### Payment Processing
- [ ] Payment method integration
- [ ] Payment status tracking
- [ ] Invoice generation
- [ ] Payment verification
- [ ] Automatic payment reminders

### Shipping
- [ ] Shipping method configuration
- [ ] Automatic cost calculation
- [ ] Tracking number integration
- [ ] Delivery status tracking

### Customer Management
- [ ] Customer profile management
- [ ] Address book
- [ ] Order history
- [ ] Wishlist (optional MVP+)
- [ ] Review & rating system

### Merchant Dashboard
- [ ] Sales analytics
- [ ] Order management
- [ ] Product performance
- [ ] Customer insights
- [ ] Financial reports

## 📝 Development Notes

### Database (SQLite)
- Menggunakan SQLite untuk development, mudah setup tanpa external dependency
- Untuk production: migrate ke PostgreSQL atau MySQL
- Semua migrations siap di folder `database/migrations/`
- Query optimization & indexing akan ditambahkan saat production

### API Standards
- Mengikuti REST API conventions
- Semua responses dalam format JSON
- Consistent error responses dengan HTTP status codes
- Request validation menggunakan Laravel Form Requests
- Pagination untuk endpoints yang return list

### Authentication
- Menggunakan Laravel Sanctum untuk API token authentication
- JWT-like token generation
- Token expiry & refresh mechanism
- Multi-tenant support untuk merchant isolation

### File Upload
- Image uploads untuk products & profiles
- File storage menggunakan Laravel Storage (lokal/cloud)
- Image optimization & resizing dengan Intervention/Image
- Separate large file uploads untuk better performance

### Error Handling
- Custom exception handling dengan custom responses
- Proper HTTP status codes (400, 401, 403, 404, 500, etc)
- Detailed error messages untuk development, generic untuk production
- Logging semua errors untuk debugging

### Performance & Scaling
- Database indexes pada frequently queried columns
- Query optimization dengan eager loading (Eloquent relationships)
- Caching untuk expensive queries (Redis optional)
- Rate limiting untuk API endpoints
- Pagination untuk list endpoints (default 15-20 items per page)

### Security
- Password hashing dengan bcrypt
- CORS configuration untuk frontend communication
- HTTPS enforcement di production
- SQL injection protection (Eloquent ORM)
- CSRF protection untuk web routes
- Input validation & sanitization
- Role-based authorization middleware

## 🤝 Kontribusi

Project ini adalah bagian dari SaaS Jualin yang dikembangkan untuk kebutuhan e-commerce modern.

## 📞 Kontak & Informasi

Untuk pertanyaan teknis atau issues, silakan hubungi tim development Jualin.

---

**Last Updated**: December 11, 2025 - Phase 6 Complete with Testing & Error Handling  
**Status**: ✅ Phase 1-6 Complete (166/166 Tests Passing), Phase 7 Ready to Start  
**Database**: SQLite (Development) → PostgreSQL/MySQL (Production)  
**API Version**: v1.0
