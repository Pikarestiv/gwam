<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RevealInterest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RevealInterestController extends Controller
{
  public function store(Request $request)
  {
    $data = $this->check($request->all(), ['message_id' => 'required|exists:messages,id']);
    if ($data instanceof JsonResponse) {
      return $data;
    }

    RevealInterest::firstOrCreate([
      'message_id' => $data['message_id'],
      'requester_user_id' => $request->user()->id,
    ]);

    return $this->ok("You're on the waitlist! We'll notify you when reveal hints launch.");
  }
}
