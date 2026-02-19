<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminSettingsController extends Controller
{
  public function show()
  {
    $announcement = \App\Models\Announcement::where('is_active', true)->latest()->first();
    return response()->json(['success' => true, 'message' => 'Settings.', 'data' => ['announcement' => $announcement]]);
  }

  public function update(Request $request)
  {
    $validator = Validator::make($request->all(), ['announcement' => 'nullable|string|max:500']);
    if ($validator->fails())
      return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
    \App\Models\Announcement::where('is_active', true)->update(['is_active' => false]);
    if ($request->announcement) {
      \App\Models\Announcement::create(['content' => $request->announcement, 'is_active' => true, 'created_by' => $request->user()->id]);
    }
    return response()->json(['success' => true, 'message' => 'Settings updated.', 'data' => []]);
  }
}