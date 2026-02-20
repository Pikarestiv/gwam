<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Artisan;

class AdminSettingsController extends Controller
{
  public function show()
  {
    $announcement = \App\Models\Announcement::where('is_active', true)->latest()->first();
    $isMaintenance = app()->isDownForMaintenance();

    return response()->json([
      'success' => true,
      'message' => 'Settings.',
      'data' => [
        'announcement' => $announcement,
        'maintenance_mode' => $isMaintenance
      ]
    ]);
  }

  public function update(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'announcement' => 'nullable|string|max:500',
      'maintenance_mode' => 'sometimes|boolean'
    ]);

    if ($validator->fails()) {
      return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
    }

    if ($request->has('maintenance_mode')) {
      if ($request->maintenance_mode) {
        Artisan::call('down', ['--secret' => 'gwam-admin-bypass']); // Optional secret, but we IP/route excluded anyway
      }
      else {
        Artisan::call('up');
      }
    }

    \App\Models\Announcement::where('is_active', true)->update(['is_active' => false]);
    if ($request->announcement) {
      \App\Models\Announcement::create(['content' => $request->announcement, 'is_active' => true, 'created_by' => $request->user()->id]);
    }

    return response()->json(['success' => true, 'message' => 'Settings updated.', 'data' => []]);
  }
}