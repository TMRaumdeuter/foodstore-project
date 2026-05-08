# 🍔 FoodStore - Hệ thống Quản lý và Kinh doanh Thực phẩm Trực tuyến

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![NestJS](https://img.shields.io/badge/backend-NestJS-red.svg)
![Next.js](https://img.shields.io/badge/frontend-Next.js-black.svg)
![MongoDB](https://img.shields.io/badge/database-MongoDB-green.svg)

FoodStore là một nền tảng thương mại điện tử hiện đại dành cho việc kinh doanh thực phẩm và đồ uống. Dự án được xây dựng với kiến trúc Monorepo, tối ưu hóa hiệu suất và khả năng mở rộng.

---

## 📖 Mục lục

1. [Ý tưởng & Mục tiêu](#-ý-tưởng--mục-tiêu)
2. [Chuẩn bị hệ thống](#-chuẩn-bị-hệ-thống)
3. [Cấu trúc dự án](#-cấu-trúc-dự-án)
4. [Thiết kế hệ thống](#-thiết-kế-hệ-thống)
5. [Docker & Deployment](#-docker--deployment)
6. [Cơ sở dữ liệu (MongoDB)](#-cơ-sở-dữ-liệu-mongodb)
7. [Hướng dẫn cài đặt](#-hướng-dẫn-cài-đặt)

---

## 💡 Ý tưởng & Mục tiêu

Dự án ra đời nhằm giải quyết bài toán quản lý kinh doanh thực phẩm trong kỷ nguyên số.

- **Đối với khách hàng:** Cung cấp trải nghiệm đặt hàng mượt mà, giao diện hiện đại (Glassmorphism), tìm kiếm thông minh và thanh toán nhanh chóng.
- **Đối với quản trị viên:** Cung cấp bộ công cụ quản lý toàn diện từ sản phẩm, đơn hàng, kho bãi đến các chiến dịch khuyến mãi (Vouchers).
- **Công nghệ:** Sử dụng các công nghệ mới nhất (Next.js 15, NestJS 11, MongoDB 7) để đảm bảo tính ổn định và tốc độ.

---

## 🛠 Chuẩn bị hệ thống

Để chạy dự án này, bạn cần cài đặt các công cụ sau:

- **Node.js:** Phiên bản 20.x trở lên.
- **Docker & Docker Compose:** Để chạy các dịch vụ database và môi trường container.
- **NPM/PNPM:** Quản lý package.
- **Git:** Sao lưu và quản lý mã nguồn.

---

## 📂 Cấu trúc dự án (Monorepo)

Dự án sử dụng cấu trúc Monorepo để quản lý nhiều ứng dụng trong cùng một repository:

```text
foodstore-project/
├── apps/
│   ├── api/            # Backend API (NestJS)
│   ├── web/            # Frontend cho khách hàng (Next.js)
│   ├── admin/          # Dashboard cho quản trị viên (React + Vite)
│   └── uploads/        # Lưu trữ hình ảnh sản phẩm/người dùng
├── packages/
│   └── shared/         # Các kiểu dữ liệu (Types) và Utils dùng chung
├── docker-compose.yml  # File cấu hình Docker cho toàn bộ hệ thống
├── FOODSTORE_DATABASE.json # Dữ liệu mẫu ban đầu
└── package.json        # Cấu hình root monorepo
```

---

## 🏗 Thiết kế hệ thống

### 1. Kiến trúc Monorepo & Shared Package

Dự án sử dụng **Turborepo** (hoặc cấu trúc tương đương) để quản lý:

- **`packages/shared`**: Chứa các DTO (Data Transfer Objects), Typescript Interfaces, và Validation Logic dùng chung cho cả Backend và Frontend. Điều này giúp đảm bảo tính đồng bộ dữ liệu (Type-safety) trên toàn hệ thống.

### 2. Backend (API)

- Xây dựng trên **NestJS**, một framework Node.js mạnh mẽ, dễ bảo trì.
- Sử dụng **Passport.js** cho xác thực JWT.
- **Mongoose** đóng vai trò là lớp ODM để giao tiếp với MongoDB.
- Tích hợp **Swagger UI** để tự động tạo tài liệu API.

### 3. Frontend (Web & Admin)

- **Web App**: Sử dụng **Next.js 15 (App Router)** để tối ưu SEO và tốc độ tải trang (Server-side Rendering).
- **Admin App**: Sử dụng **React + Vite** cho tốc độ phản hồi cực nhanh trong các tác vụ quản trị.
- **Styling**: Tận dụng sức mạnh của Vanilla CSS kết hợp với hệ thống Design Token nhất quán.

### 4. Giao diện người dùng (UI/UX)

- Thiết kế theo phong cách **Premium Dark Mode** và **Glassmorphism**.
- Sử dụng **Framer Motion** cho các micro-animations, giúp giao diện trở nên "sống động" hơn.
- Đạt điểm số cao trên Lighthouse về Performance và Accessibility.

### 5. Quy trình xử lý đơn hàng

`Khách hàng chọn món` -> `Giỏ hàng` -> `Checkout (QR Code/Tiền mặt)` -> `Admin xác nhận` -> `Giao hàng/Hoàn thành`.

---

## 🐳 Docker & Deployment

Hệ thống được Docker hóa hoàn toàn để dễ dàng triển khai.

### Các dịch vụ trong `docker-compose.yml`

- **mongodb:** Database chính (Port 27017).
- **redis:** Lưu trữ cache và session (Port 6379).
- **api:** NestJS Backend (Port 4000).
- **web:** Next.js Frontend (Port 3000).
- **admin:** Vite Admin Dashboard (Port 5173).

---

## 🍃 Cơ sở dữ liệu (MongoDB)

Sử dụng MongoDB với Mongoose ODM. Các Schema chính bao gồm:

- **Users:** Thông tin tài khoản, vai trò (Admin/User).
- **Products:** Thông tin chi tiết món ăn, giá, phân loại, đánh giá.
- **Orders:** Chi tiết đơn hàng, trạng thái thanh toán, lịch sử giao hàng.
- **Vouchers:** Mã giảm giá, điều kiện áp dụng.
- **Reviews:** Phản hồi của khách hàng về sản phẩm.

Dữ liệu được quản lý linh hoạt, hỗ trợ query phức tạp cho báo cáo doanh thu trên Dashboard.

---

## 🚀 Hướng dẫn cài đặt

### Cách 1: Sử dụng Docker (Khuyên dùng)

1. Clone dự án:

   ```bash
   git clone https://github.com/TMRaumdeuter/foodstore-project.git
   ```

2. Chạy toàn bộ hệ thống:

   ```bash
   docker-compose up --build
   ```

3. Truy cập:

   - Web: `http://localhost:3000`
   - Admin: `http://localhost:5173`
   - API Docs: `http://localhost:4000/api/docs`

### Cách 2: Chạy thủ công (Development)

1. Cài đặt dependencies tại root:

   ```bash
   npm install
   ```

2. Cài đặt env cho từng app trong `apps/`.

3. Chạy các ứng dụng:

   ```bash
   # Chạy API
   npm run dev --filter api
   # Chạy Web
   npm run dev --filter web
   ```

---

## 📝 Giấy phép

Dự án được phát hành dưới giấy phép MIT.

---

### Liên hệ

Phát triển bởi đội ngũ TMRaumdeuter - 2026
