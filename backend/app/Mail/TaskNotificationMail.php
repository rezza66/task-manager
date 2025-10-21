<?php

namespace App\Mail;

use App\Models\Task;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class TaskNotificationMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $task;
    public $action;
    public $user;

    public function __construct(Task $task, string $action, $user)
    {
        $this->task = $task;
        $this->action = $action;
        $this->user = $user;
    }

    public function build()
    {
        $subject = $this->getSubject();
        
        return $this->subject($subject)
                    ->view('emails.task-notification')
                    ->with([
                        'task' => $this->task,
                        'action' => $this->action,
                        'user' => $this->user,
                    ]);
    }

    private function getSubject()
    {
        $subjects = [
            'created' => "🎯 New Task: {$this->task->title}",
            'updated' => "📝 Task Updated: {$this->task->title}", 
            'status_updated' => "🔄 Status Changed: {$this->task->title}",
        ];

        return $subjects[$this->action] ?? "📋 Task Notification: {$this->task->title}";
    }
}