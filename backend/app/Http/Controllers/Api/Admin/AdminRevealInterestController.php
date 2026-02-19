<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\RevealInterest;

class AdminRevealInterestController extends Controller
{
  public function count()
  {
    return response()->json(['success' => true, 'message' => 'Reveal interest count.', 'data' => ['count' => RevealInterest::where('status', 'pending')->count()]]);
  }
}