Task Manager App
A full-stack task management application with real-time notifications, reporting, and team collaboration features.

🚀 Tech Stack
Backend: Laravel 12, MySQL

Frontend: React 18, Vite, Tailwind CSS

Email: Mailpit (development)

Authentication: Laravel Sanctum

Queue: Database Queue

📦 Prerequisites
Before you begin, ensure you have installed:

PHP 8.1 or higher

Node.js 18 or higher

MySQL 8.0 or higher

Composer

Git

🛠️ Installation & Setup
Step 1: Clone Repository
bash
git clone <your-repository-url>
cd task-manager
Step 2: Backend Setup
Navigate to backend directory

bash
cd backend
Install PHP dependencies

bash
composer install
Environment Configuration

bash
cp .env.example .env
php artisan key:generate
Configure Database
Edit .env file with your database credentials:

env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=task_manager
DB_USERNAME=root
DB_PASSWORD=your_mysql_password_here
Create Database

bash
# Login to MySQL and create database
mysql -u root -p
CREATE DATABASE task_manager;
EXIT;
Run Database Migrations & Seeding

bash
php artisan migrate
php artisan db:seed
Generate Storage Link

bash
php artisan storage:link
Step 3: Frontend Setup
Navigate to frontend directory

bash
cd ../frontend
Install Node.js dependencies

bash
npm install
Environment Configuration

bash
cp .env.example .env
Edit .env file:

env
VITE_API_BASE_URL=http://localhost:8000/api
Step 4: Email Setup (Development)
Download Mailpit for Windows

Visit: https://github.com/axllent/mailpit/releases

Download mailpit-windows-amd64.exe

Save it in your project root as mailpit.exe

Configure Email in Backend .env
Edit backend/.env file:

env
MAIL_MAILER=smtp
MAIL_HOST=127.0.0.1
MAIL_PORT=1025
MAIL_USERNAME=null
MAIL_PASSWORD=null
MAIL_ENCRYPTION=null
MAIL_FROM_ADDRESS=notifications@taskmanager.com
MAIL_FROM_NAME="Task Manager"

QUEUE_CONNECTION=database
🏃‍♂️ Running the Application
You need to run these services in separate terminal windows:

Terminal 1: Mailpit (Email Testing)
bash
# Navigate to where you saved mailpit.exe
./mailpit.exe
Access Email Interface: http://localhost:8025

Terminal 2: Backend Server
bash
cd backend
php artisan serve
API Server: http://localhost:8000

Terminal 3: Queue Worker (Important for Email)
bash
cd backend
php artisan queue:work
Terminal 4: Frontend Development
bash
cd frontend
npm run dev
Web Application: http://localhost:5173


📧 Testing Email Notifications
To verify email functionality:

Ensure all 4 terminals are running

Login to the application at http://localhost:5173

Create a new task or update an existing task

Open http://localhost:8025 to view all sent emails

You should see notification emails in Mailpit

📁 Project Structure
text
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
│   └── storage/            # Storage for files and logs
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable React Components
│   │   ├── pages/          # Page Components (Login, Dashboard, Tasks)
│   │   ├── services/       # API Service Functions
│   │   └── contexts/       # React Contexts
│   └── public/             # Static Assets
└── README.md               # This file

🐛 Common Issues & Solutions
Port 8000 Already in Use
bash
# Find process using port 8000
netstat -ano | findstr :8000

# Kill the process
taskkill /PID <PROCESS_ID> /F
Migration Errors
bash

# Reset database and re-run migrations
php artisan migrate:fresh
php artisan db:seed
Queue Worker Not Processing Jobs
bash

# Restart the queue worker
php artisan queue:restart
php artisan queue:work
Email Not Sending
Verify Mailpit is running in Terminal 1

Check that queue worker is running in Terminal 3

Confirm .env mail configuration is correct

Restart all services

Frontend Cannot Connect to API
Ensure backend server is running on port 8000

Check VITE_API_BASE_URL in frontend .env file

Verify no CORS issues in browser console

🧪 Testing the Application
Backend Tests
bash
cd backend
php artisan test
Frontend Tests
bash
cd frontend
npm test
📞 Support
If you encounter issues:

Check Laravel Logs: backend/storage/logs/laravel.log

Verify Services: Ensure all 4 terminals are running

Database Connection: Confirm MySQL is running and database exists

File Permissions: Ensure storage directory is writable

🎯 Next Steps
After successful setup:

Login with the test accounts

Create tasks and assign to users

Check Mailpit for email notifications

Generate reports from the dashboard

Explore all features of the task manager

Enjoy using your Task Manager! 🚀