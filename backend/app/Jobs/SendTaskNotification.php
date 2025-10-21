<?php

namespace App\Jobs;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendTaskNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $task;
    public $action;
    public $tries = 3;

    public function __construct(Task $task, string $action)
    {
        $this->task = $task->withoutRelations();
        $this->action = $action;
    }

    public function handle()
    {
        try {
            $usersToNotify = $this->getUsersToNotify();

            foreach ($usersToNotify as $user) {
                $this->sendNotification($user);
            }

            Log::info("Task notification sent for task {$this->task->id}", [
                'action' => $this->action,
                'notified_users' => count($usersToNotify)
            ]);
        } catch (\Exception $e) {
            Log::error("Failed to send task notification: {$e->getMessage()}");
            throw $e;
        }
    }

    private function getUsersToNotify()
    {
        $users = [];

        // Notify task creator
        if ($this->task->user) {
            $users[] = $this->task->user;
        }

        // Notify assignee if different from creator
        if ($this->task->assignee && $this->task->assignee->id !== $this->task->user_id) {
            $users[] = $this->task->assignee;
        }

        return $users;
    }

    private function sendNotification(User $user)
    {
        $subject = $this->getNotificationSubject();
        $message = $this->getNotificationMessage($user);

        Log::info("🎯 Sending notification to {$user->email}: {$subject}");

        // ✅ UNCOMMENT DAN AKTIFKAN EMAIL
        try {
            Mail::to($user->email)->send(new \App\Mail\TaskNotificationMail(
                $this->task,
                $this->action,
                $user
            ));

            Log::info("✅ Email sent successfully to {$user->email}");
        } catch (\Exception $e) {
            Log::error("❌ Failed to send email to {$user->email}: " . $e->getMessage());
        }
    }

    private function getNotificationSubject()
    {
        $subjects = [
            'created' => "New Task Assigned: {$this->task->title}",
            'updated' => "Task Updated: {$this->task->title}",
            'status_updated' => "Task Status Changed: {$this->task->title}",
            'due_date_updated' => "Task Due Date Updated: {$this->task->title}",
        ];

        return $subjects[$this->action] ?? "Task Notification: {$this->task->title}";
    }

    private function getNotificationMessage(User $user)
    {
        $actionText = $this->getActionText();
        return "Hello {$user->name}, {$actionText} for task: '{$this->task->title}'";
    }

    private function getActionText()
    {
        $actions = [
            'created' => 'a new task has been assigned to you',
            'updated' => 'a task has been updated',
            'status_updated' => 'the task status has been changed',
            'due_date_updated' => 'the due date has been updated',
        ];

        return $actions[$this->action] ?? 'there is an update';
    }

    public function failed(\Exception $exception)
    {
        Log::error("SendTaskNotification job failed for task {$this->task->id}: {$exception->getMessage()}");
    }
}
