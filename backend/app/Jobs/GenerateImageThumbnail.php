<?php

namespace App\Jobs;

use App\Models\TaskAttachment;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Intervention\Image\Laravel\Facades\Image;

class GenerateImageThumbnail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $attachment;

    public function __construct(TaskAttachment $attachment)
    {
        $this->attachment = $attachment;
    }

    public function handle(): void
    {
        $path = storage_path('app/public/' . $this->attachment->file_path);

        if (!file_exists($path)) {
            Log::warning("File not found for thumbnail generation: {$path}");
            return;
        }

        try {
            $img = Image::read($path)->cover(300, 200);

            $thumbPath = str_replace('.', '_thumb.', $this->attachment->file_path);
            Storage::disk('public')->put($thumbPath, (string) $img->encode());

            Log::info("✅ Thumbnail generated successfully: {$thumbPath}");
        } catch (\Exception $e) {
            Log::error("❌ Failed to generate thumbnail: " . $e->getMessage());
        }
    }
}
