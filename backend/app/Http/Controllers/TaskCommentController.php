<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class TaskCommentController extends Controller
{
    public function index($taskId)
    {
        $task = Task::findOrFail($taskId);

        // Authorization check
        if ($task->user_id !== Auth::id() && $task->assigned_to !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $comments = $task->comments()->with('user')->latest()->get();

        return response()->json($comments);
    }

    public function store(Request $request, $taskId)
    {
        $task = Task::findOrFail($taskId);

        // Authorization check
        if ($task->user_id !== Auth::id() && $task->assigned_to !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'comment' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $comment = TaskComment::create([
            'task_id' => $task->id,
            'user_id' => Auth::id(),
            'comment' => $request->comment,
        ]);

        return response()->json([
            'message' => 'Comment added successfully',
            'comment' => $comment->load('user')
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $comment = TaskComment::with('task')->findOrFail($id);

        // Only comment author can update
        if ($comment->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized - Only comment author can update'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'comment' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'errors' => $validator->errors()
            ], 422);
        }

        $comment->update([
            'comment' => $request->comment,
        ]);

        return response()->json([
            'message' => 'Comment updated successfully',
            'comment' => $comment->load('user')
        ]);
    }

    public function destroy($id)
    {
        $comment = TaskComment::with('task')->findOrFail($id);

        // Only comment author or task owner can delete
        if ($comment->user_id !== Auth::id() && $comment->task->user_id !== Auth::id()) {
            return response()->json([
                'message' => 'Unauthorized'
            ], 403);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully'
        ]);
    }
}