<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Report;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController extends Controller
{
  public function store(Request $request)
  {
    $data = $this->check($request->all(), [
      'message_id' => 'nullable|exists:messages,id',
      'room_message_id' => 'nullable|exists:room_messages,id',
      'reason' => 'required|in:harassment,threats,explicit,spam,other',
      'extra_detail' => 'nullable|string|max:500',
    ]);
    if ($data instanceof JsonResponse) {
      return $data;
    }

    Report::create($data + [
      'reporter_user_id' => $request->user()?->id,
      'reporter_ip' => $request->ip(),
    ]);

    return $this->ok('Report submitted. Our team will review it.');
  }
}
