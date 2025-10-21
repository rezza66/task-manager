<?php

namespace App\Http\Controllers;

use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ReportController extends Controller
{
    public function index()
    {
        $reports = Report::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json($reports);
    }

    public function download($id)
    {
        $report = Report::where('user_id', Auth::id())->findOrFail($id);

        if ($report->status !== 'completed') {
            return response()->json([
                'message' => 'Report is not ready for download'
            ], 400);
        }

        if (!Storage::disk('public')->exists($report->file_path)) {
            return response()->json([
                'message' => 'Report file not found'
            ], 404);
        }

        $filePath = storage_path('app/public/' . $report->file_path);

        if (!file_exists($filePath)) {
            return response()->json(['message' => 'Report file not found'], 404);
        }

        return response()->download($filePath, $report->filename);
    }

    public function destroy($id)
    {
        $report = Report::where('user_id', Auth::id())->findOrFail($id);

        // Delete file from storage
        if (Storage::disk('public')->exists($report->file_path)) {
            Storage::disk('public')->delete($report->file_path);
        }

        $report->delete();

        return response()->json([
            'message' => 'Report deleted successfully'
        ]);
    }
}
