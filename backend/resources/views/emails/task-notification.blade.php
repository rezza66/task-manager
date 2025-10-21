<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Task Notification</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { background: #f9fafb; padding: 20px; margin: 20px 0; }
        .task-info { background: white; padding: 15px; border-left: 4px solid #3b82f6; margin: 10px 0; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Task Manager Notification</h1>
        </div>
        
        <div class="content">
            <h2>Hello {{ $user->name }},</h2>
            
            @if($action === 'created')
                <p>A new task has been assigned to you:</p>
            @elseif($action === 'updated')
                <p>A task you're involved with has been updated:</p>
            @elseif($action === 'status_updated')
                <p>The status of a task has been changed:</p>
            @else
                <p>There's an update on a task:</p>
            @endif
            
            <div class="task-info">
                <h3>{{ $task->title }}</h3>
                <p><strong>Status:</strong> {{ ucfirst($task->status) }}</p>
                <p><strong>Priority:</strong> {{ ucfirst($task->priority) }}</p>
                @if($task->due_date)
                    <p><strong>Due Date:</strong> {{ \Carbon\Carbon::parse($task->due_date)->format('F j, Y') }}</p>
                @endif
                @if($task->description)
                    <p><strong>Description:</strong> {{ $task->description }}</p>
                @endif
            </div>
            
            <p>
                <a href="{{ url('/tasks/' . $task->id) }}" class="button">
                    View Task Details
                </a>
            </p>
        </div>
        
        <div class="footer">
            <p>This is an automated notification from Task Manager.</p>
            <p>If you have any questions, please contact your administrator.</p>
        </div>
    </div>
</body>
</html>