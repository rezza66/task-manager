<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\TaskAttachment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Intervention\Image\Laravel\Facades\Image; // ✅ Untuk Laravel 12 / Intervention v3

class TaskAttachmentController extends Controller
{
    public function index($taskId)
    {
        $task = Task::findOrFail($taskId);

        if ($task->user_id !== Auth::id() && $task->assigned_to !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $attachments = $task->attachments()->with('uploader')->get();
        return response()->json($attachments);
    }

    public function store(Request $request, $taskId)
    {
        Log::info('File upload started', ['task_id' => $taskId, 'user_id' => Auth::id()]);

        $task = Task::findOrFail($taskId);

        if ($task->user_id !== Auth::id() && $task->assigned_to !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'file' => 'required|file|max:10240|mimes:jpg,jpeg,png,gif,webp,pdf,doc,docx,txt,zip,rar,mp4,mpeg',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();

            Log::info('File details', [
                'name' => $originalName,
                'size' => $file->getSize(),
                'mime' => $file->getMimeType()
            ]);

            // Sanitize filename
            $fileName = time() . '_' . preg_replace('/[^a-zA-Z0-9\.\-]/', '_', $originalName);
            $filePath = $file->store('attachments', 'public');

            Log::info('File stored', ['path' => $filePath]);

            $thumbnailPath = null;

            // Create thumbnail for images (Intervention Image v3)
            if (in_array($file->getMimeType(), ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])) {
                try {
                    Log::info('Creating thumbnail for image');
                    $thumbnailPath = $this->createThumbnail($file);
                    Log::info('Thumbnail created', ['path' => $thumbnailPath]);
                } catch (\Exception $e) {
                    Log::error('Thumbnail creation failed', [
                        'error' => $e->getMessage(),
                        'file' => $originalName
                    ]);
                    // Continue without thumbnail if creation fails
                }
            }

            $attachment = TaskAttachment::create([
                'task_id' => $task->id,
                'file_name' => $originalName,
                'file_path' => $filePath,
                'file_size' => $file->getSize(),
                'mime_type' => $file->getMimeType(),
                'thumbnail_path' => $thumbnailPath,
                'uploaded_by' => Auth::id(),
            ]);

            Log::info('Attachment created successfully', ['attachment_id' => $attachment->id]);

            return response()->json([
                'message' => 'File uploaded successfully',
                'attachment' => $attachment->load('uploader')
            ], 201);
        } catch (\Exception $e) {
            Log::error('File upload failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'message' => 'File upload failed: ' . $e->getMessage()
            ], 500);
        }
    }

    public function destroy($id)
    {
        $attachment = TaskAttachment::with('task')->findOrFail($id);
        $task = $attachment->task;

        if ($task->user_id !== Auth::id() && $task->assigned_to !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        try {
            // Delete files from storage
            if (Storage::disk('public')->exists($attachment->file_path)) {
                Storage::disk('public')->delete($attachment->file_path);
            }

            if ($attachment->thumbnail_path && Storage::disk('public')->exists($attachment->thumbnail_path)) {
                Storage::disk('public')->delete($attachment->thumbnail_path);
            }

            $attachment->delete();

            return response()->json(['message' => 'Attachment deleted successfully']);
        } catch (\Exception $e) {
            Log::error('Attachment deletion failed', [
                'error' => $e->getMessage(),
                'attachment_id' => $id
            ]);

            return response()->json([
                'message' => 'Failed to delete attachment'
            ], 500);
        }
    }

    public function download($id)
    {
        $attachment = TaskAttachment::with('task')->findOrFail($id);
        $task = $attachment->task;

        if ($task->user_id !== Auth::id() && $task->assigned_to !== Auth::id()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Ambil path file di storage
        $filePath = storage_path('app/public/' . $attachment->file_path);

        if (!file_exists($filePath)) {
            return response()->json(['error' => 'File not found'], 404);
        }

        return response()->download($filePath, $attachment->file_name);
    }


    private function createThumbnail($file)
    {
        try {
            // Intervention Image v3 approach
            $image = Image::read($file->getRealPath());

            // Resize image to thumbnail size (max 150px while maintaining aspect ratio)
            $image->scale(150, 150);

            // Alternative resize method for v3
            $image->resize(150, 150, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upSize();
            });

            $thumbnailName = 'thumb_' . time() . '_' . $file->getClientOriginalName();
            $thumbnailPath = 'thumbnails/' . $thumbnailName;

            // Encode and save thumbnail
            $encodedImage = $image->toJpeg(80); // 80% quality
            Storage::disk('public')->put($thumbnailPath, $encodedImage);

            return $thumbnailPath;
        } catch (\Exception $e) {
            Log::error('Thumbnail creation failed: ' . $e->getMessage());
            return null;
        }
    }
}
