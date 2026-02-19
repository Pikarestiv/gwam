<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminReportController extends Controller
{
  public function index()
  {
    $reports = Report::with(['message.recipient:id,username', 'reporter:id,username'])
      ->orderByDesc('created_at')
      ->paginate(25);
    return response()->json(['success' => true, 'message' => 'Reports retrieved.', 'data' => $reports]);
  }

  public function update(Request $request, int $id)
  {
    $validator = Validator::make($request->all(), [
      'status' => 'required|in:pending,reviewed,resolved',
      'admin_note' => 'nullable|string|max:500',
    ]);
    if ($validator->fails())
      return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
    Report::findOrFail($id)->update($request->only(['status', 'admin_note']));
    return response()->json(['success' => true, 'message' => 'Report updated.', 'data' => []]);
  }
}