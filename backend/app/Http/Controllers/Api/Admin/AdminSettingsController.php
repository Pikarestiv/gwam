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
        'maintenance_mode' => $isMaintenance,
        'system' => [
          'php_version' => PHP_VERSION,
          'laravel_version' => app()->version(),
          'environment' => config('app.env'),
          'debug_mode' => (bool) config('app.debug'),
          'timezone' => config('app.timezone'),
          'app_url' => config('gwam.app_url', 'https://gwam.dumostech.com/app'),
          'api_url' => config('app.url', 'https://gwam-api.dumostech.com'),
          'vapid_configured' => !empty(config('gwam.vapid.public')) && !empty(config('gwam.vapid.private')),
          'paystack_configured' => !empty(config('gwam.paystack_secret')),
          'room_prices' => config('gwam.room_prices_kobo', []),
        ],
      ],
    ]);
  }

  public function update(Request $request)
  {
    $validator = Validator::make($request->all(), [
      'announcement' => 'nullable|string|max:500',
      'clear_announcement' => 'sometimes|boolean',
      'maintenance_mode' => 'sometimes|boolean',
      'clear_cache' => 'sometimes|boolean',
    ]);

    if ($validator->fails()) {
      return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
    }

    if ($request->has('maintenance_mode')) {
      if ($request->maintenance_mode) {
        Artisan::call('down'); // /api/v1/admin/* is whitelisted in PreventRequestsDuringMaintenance
      } else {
        Artisan::call('up');
      }
    }

    if ($request->boolean('clear_announcement')) {
      \App\Models\Announcement::where('is_active', true)->update(['is_active' => false]);
    } elseif ($request->filled('announcement')) {
      \App\Models\Announcement::where('is_active', true)->update(['is_active' => false]);
      \App\Models\Announcement::create([
        'content' => $request->announcement,
        'is_active' => true,
        'created_by' => $request->user()?->id,
      ]);
    }

    if ($request->boolean('clear_cache')) {
      Artisan::call('cache:clear');
    }

    return response()->json(['success' => true, 'message' => 'Settings updated.', 'data' => []]);
  }
}