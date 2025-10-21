<?php

namespace App\Jobs;

use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Batchable;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class BulkUpdateTasks implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $taskIds;
    public $updateData;
    public $user;
    public $tries = 3;

    public function __construct(array $taskIds, array $updateData, User $user)
    {
        $this->taskIds = $taskIds;
        $this->updateData = $updateData;
        $this->user = $user->withoutRelations();
    }

    public function handle()
    {
        try {
            Log::info("Starting bulk update for {$this->user->id}", [
                'task_count' => count($this->taskIds),
                'updates' => $this->updateData
            ]);

            $updatedCount = 0;

            foreach ($this->taskIds as $taskId) {
                $task = Task::find($taskId);

                if ($task && $this->canUpdateTask($task)) {
                    $task->update($this->updateData);
                    $updatedCount++;

                    // Dispatch notification for each updated task
                    SendTaskNotification::dispatch($task, 'updated');
                }
            }

            Log::info("Bulk update completed: {$updatedCount} tasks updated");

        } catch (\Exception $e) {
            Log::error("Bulk update failed: {$e->getMessage()}");
            throw $e;
        }
    }

    private function canUpdateTask(Task $task)
    {
        // Check if user can update this task
        return $task->user_id === $this->user->id || $task->assigned_to === $this->user->id;
    }

    public function failed(\Exception $exception)
    {
        Log::error("BulkUpdateTasks job failed: {$exception->getMessage()}");
    }
}