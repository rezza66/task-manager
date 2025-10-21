<?php

namespace Database\Seeders;

use App\Models\Task;
use App\Models\TaskAttachment;
use App\Models\TaskComment;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        // Clear storage
        Storage::disk('public')->deleteDirectory('attachments');
        Storage::disk('public')->deleteDirectory('thumbnails');
        Storage::disk('public')->makeDirectory('attachments');
        Storage::disk('public')->makeDirectory('thumbnails');

        // Create users
        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@taskmanager.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        $user1 = User::create([
            'name' => 'John Doe',
            'email' => 'john@taskmanager.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        $user2 = User::create([
            'name' => 'Jane Smith',
            'email' => 'jane@taskmanager.com',
            'password' => Hash::make('password123'),
            'email_verified_at' => now(),
        ]);

        // Create tasks
        $tasks = [
            [
                'title' => 'Setup Development Environment',
                'description' => 'Setup Laravel backend and React frontend for the task management platform',
                'status' => 'completed',
                'priority' => 'high',
                'due_date' => now()->subDays(2),
                'user_id' => $admin->id,
                'assigned_to' => $user1->id,
            ],
            [
                'title' => 'Implement User Authentication',
                'description' => 'Create login, registration, and password reset functionality',
                'status' => 'in_progress',
                'priority' => 'high',
                'due_date' => now()->addDays(3),
                'user_id' => $admin->id,
                'assigned_to' => $admin->id,
            ],
            [
                'title' => 'Design Database Schema',
                'description' => 'Design and implement MySQL database schema for tasks, users, attachments, and comments',
                'status' => 'completed',
                'priority' => 'medium',
                'due_date' => now()->subDays(5),
                'user_id' => $user1->id,
                'assigned_to' => $user2->id,
            ],
            [
                'title' => 'Create API Endpoints',
                'description' => 'Develop RESTful API endpoints for task management operations',
                'status' => 'in_progress',
                'priority' => 'high',
                'due_date' => now()->addDays(2),
                'user_id' => $user2->id,
                'assigned_to' => $admin->id,
            ],
            [
                'title' => 'Implement File Upload System',
                'description' => 'Create file upload functionality with validation and thumbnail generation',
                'status' => 'pending',
                'priority' => 'medium',
                'due_date' => now()->addDays(7),
                'user_id' => $admin->id,
                'assigned_to' => $user1->id,
            ],
        ];

        foreach ($tasks as $taskData) {
            $task = Task::create($taskData);

            // Add comments to some tasks
            if ($task->title === 'Setup Development Environment') {
                TaskComment::create([
                    'task_id' => $task->id,
                    'user_id' => $admin->id,
                    'comment' => 'Development environment has been setup successfully with all required dependencies.',
                ]);

                TaskComment::create([
                    'task_id' => $task->id,
                    'user_id' => $user1->id,
                    'comment' => 'Great work! The setup looks clean and well organized.',
                ]);
            }

            if ($task->title === 'Implement User Authentication') {
                TaskComment::create([
                    'task_id' => $task->id,
                    'user_id' => $admin->id,
                    'comment' => 'Working on JWT token implementation and secure password handling.',
                ]);
            }
        }

        $this->command->info('Database seeded successfully!');
        $this->command->info('Default login credentials:');
        $this->command->info('Admin: admin@taskmanager.com / password123');
        $this->command->info('User 1: john@taskmanager.com / password123');
        $this->command->info('User 2: jane@taskmanager.com / password123');
    }
}