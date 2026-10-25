<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;

class StatsController extends Controller
{
  public function public()
  {
    return $this->ok('Stats retrieved.', ['total_messages' => Message::where('is_deleted', false)->count()]);
  }
}
