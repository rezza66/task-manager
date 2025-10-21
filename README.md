Berikut versi **rapi dan siap-paste ke GitHub README.md** kamu — sudah diformat dengan markdown yang rapi dan konsisten:

---

# 🗂️ Task Manager App

A **full-stack task management application** with real-time notifications, reporting, and team collaboration features.

---

## 🚀 Tech Stack

**Backend:** Laravel 12, MySQL
**Frontend:** React 18, Vite, Tailwind CSS
**Email (Dev):** Mailpit
**Authentication:** Laravel Sanctum
**Queue:** Database Queue

---

## 📦 Prerequisites

Before you begin, make sure you have installed:

* PHP 8.1 or higher
* Node.js 18 or higher
* MySQL 8.0 or higher
* Composer
* Git

---

## 🛠️ Installation & Setup

### **Step 1: Clone Repository**

```bash
git clone <your-repository-url>
cd task-manager
```

---

### **Step 2: Backend Setup**

Navigate to backend directory:

```bash
cd backend
```

#### Install PHP dependencies:

```bash
composer install
```

#### Environment configuration:

```bash
cp .env.example .env
php artisan key:generate
```

#### Configure Database

Edit your `.env` file:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=task_manager
DB_USERNAME=root
DB_PASSWORD=your_mysql_password_here
```

#### Create Database:

```bash
mysql -u root -p
CREATE DATABASE task_manager;
EXIT;
```

#### Run Migrations & Seeders:

```bash
php artisan migrate
php artisan db:seed
```

#### Generate Storage Link:

```bash
php artisan storage:link
```

---

### **Step 3: Frontend Setup**

Navigate to frontend directory:

```bash
cd ../frontend
```

Install Node.js dependencies:

```bash
npm install
```

Environment configuration:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

---

### **Step 4: Email Setup (Development)**

#### Download Mailpit for Windows:

* Visit: [https://github.com/axllent/mailpit/releases](https://github.com/axllent/mailpit/releases)
* Download `mailpit-windows-amd64.exe`
* Save it in your project root as `mailpit.exe`

#### Configure Email in `backend/.env`:

```env
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=notifications@taskmanager.com
MAIL_FROM_NAME="Task Manager"

QUEUE_CONNECTION=database
```

---

## 🏃‍♂️ Running the Application

You’ll need to run **four terminals**:

### **Terminal 1: Mailpit (Email Testing)**

```bash
./mailpit.exe
```

Access: [http://localhost:8025](http://localhost:8025)

---

### **Terminal 2: Backend Server**

```bash
cd backend
php artisan serve
```

API Server → [http://localhost:8000](http://localhost:8000)

---

### **Terminal 3: Queue Worker**

```bash
cd backend
php artisan queue:work
```

---

### **Terminal 4: Frontend**

```bash
cd frontend
npm run dev
```

Web App → [http://localhost:5173](http://localhost:5173)

---

## 📧 Testing Email Notifications

To test email functionality:

1. Ensure all 4 terminals are running
2. Login at [http://localhost:5173](http://localhost:5173)
3. Create or update a task
4. Open [http://localhost:8025](http://localhost:8025)
5. Check for notification emails in Mailpit

---

## 📁 Project Structure

```
task-manager/
├── backend/                 # Laravel API Backend
│   ├── app/
│   │   ├── Models/         # Eloquent Models (User, Task, Report)
│   │   ├── Http/           # Controllers, Middleware
│   │   ├── Jobs/           # Queue Jobs (SendTaskNotification, GenerateTaskReport)
│   │   └── Mail/           # Email Classes
│   ├── config/             # Configuration Files
│   ├── database/           # Migrations, Seeders
│   ├── routes/             # API Routes
│   └── storage/            # Files and logs
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable React Components
│   │   ├── pages/          # Page Components (Login, Dashboard, Tasks)
│   │   ├── services/       # API Service Functions
│   │   └── contexts/       # React Contexts
│   └── public/             # Static Assets
└── README.md
```

---

## 🐛 Common Issues & Solutions

### **Port 8000 Already in Use**

```bash
netstat -ano | findstr :8000
taskkill /PID <PROCESS_ID> /F
```

---

### **Migration Errors**

```bash
php artisan migrate:fresh
php artisan db:seed
```

---

### **Queue Worker Not Processing Jobs**

```bash
php artisan queue:restart
php artisan queue:work
```

---

### **Email Not Sending**

* Make sure Mailpit is running
* Ensure queue worker is active
* Check `.env` mail configuration
* Restart all services

---

### **Frontend Cannot Connect to API**

* Ensure backend is running on port 8000
* Check `VITE_API_BASE_URL`
* Verify no CORS issues in browser console

---

## 🧪 Testing the Application

### **Backend Tests**

```bash
cd backend
php artisan test
```

### **Frontend Tests**

```bash
cd frontend
npm test
```

---

## 📞 Support

If you face issues:

* Check logs: `backend/storage/logs/laravel.log`
* Verify all terminals are running
* Ensure database is created and connected
* Check file permissions on `/storage`

---

## 🎯 Next Steps

✅ Login with test accounts
✅ Create and assign tasks
✅ Verify email notifications in Mailpit
✅ Generate reports in dashboard
✅ Explore team collaboration features

---

**Enjoy using your Task Manager! 🚀**

---

Apakah kamu ingin saya tambahkan **preview gambar (screenshot)** dan **badge teknologi (misal Laravel, React, Tailwind)** di bagian atas README juga biar lebih menarik di GitHub?
