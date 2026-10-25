<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Services\AnalyticsService;
use Illuminate\Http\Request;

class AdminAnalyticsController extends Controller
{
  public function summary(Request $request, AnalyticsService $analytics)
  {
    $days = in_array((int) $request->query('days'), [7, 30, 90], true) ? (int) $request->query('days') : 30;

    return $this->ok('Analytics summary.', $analytics->summary($days));
  }
}
