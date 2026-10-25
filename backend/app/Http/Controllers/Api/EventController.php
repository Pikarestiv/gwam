<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class EventController extends Controller
{
  public function store(Request $request, AnalyticsService $analytics)
  {
    $data = $this->check($request->all(), [
      'name' => ['required', Rule::in(AnalyticsService::EVENTS)],
      'path' => 'nullable|string|max:120',
      'session' => 'required|string|max:40',
    ]);
    if ($data instanceof JsonResponse) {
      return $data;
    }

    $analytics->record($data['name'], $data['path'] ?? null, $data['session']);

    return $this->ok('Recorded.', [], 201);
  }
}
