<?php

namespace App\Http\Controllers;

use App\Models\Task;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use App\Jobs\SendTaskNotification;
use App\Jobs\BulkUpdateTasks;
use App\Jobs\GenerateTaskReport;

class TaskController extends Controller
{
    public function index(Request $request)
    {
        $query = Task::with(['user', 'assignee', 'attachments', 'comments.user'])
            ->where(function ($q) {
                $q->where('user_id', Auth::id())
                    ->orWhere('assigned_to', Auth::id());
            });

        // Filter by status
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        // Filter by priority
        if ($request->has('priority') && $request->priority !== 'all') {
            $query->where('priority', $request->priority);
        }

        // Search
        if ($request->has('search') && !empty($request->search)) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->search . '%')
                    ->orWhere('description', 'like', '%' . $request->search . '%');
            });
        }

        // Sort
        $sortField = $request->get('sort_field', 'created_at');
        $sortDirection = $request->get('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $tasks = $query->paginate(10);

        return response()->json($tasks);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:pending,in_progress,completed',
            'priority' => 'sometimes|in:low,medium,high',
            'due_date' => 'nullable|date|after_or_equal:today',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $task = Task::create([
            'title' => $request->title,
            'description' => $request->description,
            'status' => $request->status ?? 'pending',
            'priority' => $request->priority ?? 'medium',
            'due_date' => $request->due_date,
            'user_id' => Auth::id(),
            'assigned_to' => $request->assigned_to,
        ]);

        // ✅ BACKGROUND JOB: Send notification
        SendTaskNotification::dispatch($task->fresh(), 'created');

        return response()->json([
            'message' => 'Task created successfully',
            'task' => $task->load(['user', 'assignee'])
        ], 201);
    }

    public function show($id)
    {
        $task = Task::with(['user', 'assignee', 'attachments.uploader', 'comments.user'])
            ->findOrFail($id);

        // Authorization check
        if ($task->user_id !== Auth::id() && $task->assigned_to !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        return response()->json($task);
    }

    public function update(Request $request, $id)
    {
        $task = Task::findOrFail($id);

        // Authorization check
        if ($task->user_id !== Auth::id() && $task->assigned_to !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|in:pending,in_progress,completed',
            'priority' => 'sometimes|in:low,medium,high',
            'due_date' => 'nullable|date|after_or_equal:today',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $oldStatus = $task->status;
        $task->update($request->all());

        // ✅ BACKGROUND JOB: Send appropriate notifications
        if ($request->has('status') && $request->status !== $oldStatus) {
            SendTaskNotification::dispatch($task->fresh(), 'status_updated');
        } else {
            SendTaskNotification::dispatch($task->fresh(), 'updated');
        }

        return response()->json([
            'message' => 'Task updated successfully',
            'task' => $task->load(['user', 'assignee'])
        ]);
    }

    public function destroy($id)
    {
        $task = Task::findOrFail($id);

        // Only task creator can delete
        if ($task->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized - Only task creator can delete task'
            ], 403);
        }

        $task->delete();

        return response()->json([
            'message' => 'Task deleted successfully'
        ]);
    }

    // ✅ NEW METHOD: Bulk update tasks
    public function bulkUpdate(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'task_ids' => 'required|array',
            'task_ids.*' => 'exists:tasks,id',
            'status' => 'sometimes|in:pending,in_progress,completed',
            'priority' => 'sometimes|in:low,medium,high',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $request->only(['status', 'priority']);

        if (empty($updateData)) {
            return response()->json([
                'message' => 'No update data provided'
            ], 422);
        }

        // ✅ BACKGROUND JOB: Process bulk update
        BulkUpdateTasks::dispatch($request->task_ids, $updateData, Auth::user());

        return response()->json([
            'message' => 'Bulk update started. You will be notified when completed.'
        ]);
    }

    public function generateReport(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'report_type' => 'in:csv,pdf',
            'status' => 'nullable|in:pending,in_progress,completed',
            'priority' => 'nullable|in:low,medium,high',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        // Create report record first
        $report = \App\Models\Report::create([
            'user_id' => Auth::id(),
            'filename' => 'processing',
            'file_path' => 'processing',
            'report_type' => $request->get('report_type', 'csv'),
            'filters' => $validator->validated(),
            'status' => 'processing'
        ]);

        // Dispatch report generation job with report ID
        \App\Jobs\GenerateTaskReport::dispatch(
            Auth::user(),
            $validator->validated(),
            $request->get('report_type', 'csv'),
            $report->id
        );

        return response()->json([
            'message' => 'Report generation started. You will be notified when ready.',
            'report_id' => $report->id
        ]);
    }
}
