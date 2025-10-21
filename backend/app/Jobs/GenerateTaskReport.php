<?php

namespace App\Jobs;

use App\Models\Report;
use App\Models\Task;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class GenerateTaskReport implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $user;
    public $filters;
    public $reportType;
    public $reportId;
    public $tries = 3;

    public function __construct(User $user, array $filters = [], string $reportType = 'csv', $reportId = null)
    {
        $this->user = $user->withoutRelations();
        $this->filters = $filters;
        $this->reportType = $reportType;
        $this->reportId = $reportId;
    }

    public function handle()
    {
        try {
            Log::info("Starting report generation for user {$this->user->id}", [
                'type' => $this->reportType,
                'filters' => $this->filters,
                'report_id' => $this->reportId
            ]);

            // Create or update report record
            $report = $this->getOrCreateReport();

            $tasks = $this->getFilteredTasks();
            $filename = $this->generateReport($tasks, $report);

            // Update report with completed status
            $report->update([
                'status' => 'completed',
                'file_path' => $filename,
                'filename' => basename($filename)
            ]);

            Log::info("Report generated successfully: {$filename}");

        } catch (\Exception $e) {
            Log::error("Failed to generate report: {$e->getMessage()}");
            
            // Update report with failed status
            if (isset($report)) {
                $report->update([
                    'status' => 'failed',
                    'error_message' => $e->getMessage()
                ]);
            }
            
            throw $e;
        }
    }

    private function getOrCreateReport()
    {
        if ($this->reportId) {
            return Report::findOrFail($this->reportId);
        }

        return Report::create([
            'user_id' => $this->user->id,
            'filename' => 'processing',
            'file_path' => 'processing',
            'report_type' => $this->reportType,
            'filters' => $this->filters,
            'status' => 'processing'
        ]);
    }

    private function getFilteredTasks()
    {
        $query = Task::where(function($q) {
                $q->where('user_id', $this->user->id)
                  ->orWhere('assigned_to', $this->user->id);
            })
            ->with(['user', 'assignee'])
            ->latest();

        // Apply filters
        if (!empty($this->filters['status'])) {
            $query->where('status', $this->filters['status']);
        }

        if (!empty($this->filters['priority'])) {
            $query->where('priority', $this->filters['priority']);
        }

        if (!empty($this->filters['start_date'])) {
            $query->where('created_at', '>=', $this->filters['start_date']);
        }

        if (!empty($this->filters['end_date'])) {
            $query->where('created_at', '<=', $this->filters['end_date']);
        }

        return $query->get();
    }

    private function generateReport($tasks, $report)
    {
        if ($this->reportType === 'csv') {
            return $this->generateCsvReport($tasks, $report);
        }

        if ($this->reportType === 'pdf') {
            return $this->generatePdfReport($tasks, $report);
        }

        throw new \Exception("Unsupported report type: {$this->reportType}");
    }

    private function generateCsvReport($tasks, $report)
    {
        $filename = "reports/task_report_{$this->user->id}_" . now()->format('Y-m-d_H-i-s') . '.csv';
        $filepath = Storage::disk('public')->path($filename);

        // Create directory if not exists
        Storage::disk('public')->makeDirectory('reports');

        $handle = fopen($filepath, 'w');

        // CSV Header
        fputcsv($handle, [
            'ID', 'Title', 'Description', 'Status', 'Priority', 
            'Due Date', 'Created By', 'Assigned To', 'Created At', 'Updated At'
        ]);

        // CSV Rows
        foreach ($tasks as $task) {
            fputcsv($handle, [
                $task->id,
                $task->title,
                $task->description ?? '',
                $task->status,
                $task->priority,
                $task->due_date ? $task->due_date->format('Y-m-d') : '',
                $task->user->name,
                $task->assignee ? $task->assignee->name : 'Unassigned',
                $task->created_at->format('Y-m-d H:i:s'),
                $task->updated_at->format('Y-m-d H:i:s'),
            ]);
        }

        fclose($handle);

        return $filename;
    }

    private function generatePdfReport($tasks, $report)
    {
        // For now, we'll create a simple text file as PDF placeholder
        $filename = "reports/task_report_{$this->user->id}_" . now()->format('Y-m-d_H-i-s') . '.txt';
        
        $content = "TASK REPORT\n";
        $content .= "Generated on: " . now()->format('Y-m-d H:i:s') . "\n";
        $content .= "Total tasks: " . $tasks->count() . "\n\n";
        
        foreach ($tasks as $task) {
            $content .= "ID: {$task->id}\n";
            $content .= "Title: {$task->title}\n";
            $content .= "Status: {$task->status}\n";
            $content .= "Priority: {$task->priority}\n";
            $content .= "Due Date: " . ($task->due_date ? $task->due_date->format('Y-m-d') : 'N/A') . "\n";
            $content .= "------------------------\n";
        }

        Storage::disk('public')->put($filename, $content);

        return $filename;
    }

    public function failed(\Exception $exception)
    {
        Log::error("GenerateTaskReport job failed for user {$this->user->id}: {$exception->getMessage()}");
        
        // Update report status if it exists
        if ($this->reportId) {
            $report = Report::find($this->reportId);
            if ($report) {
                $report->update([
                    'status' => 'failed',
                    'error_message' => $exception->getMessage()
                ]);
            }
        }
    }
}