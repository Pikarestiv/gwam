<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlockedIp;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class AdminBlockedIpController extends Controller
{
  public function index()
  {
    return response()->json(['success' => true, 'message' => 'Blocked IPs.', 'data' => BlockedIp::orderByDesc('created_at')->paginate(50)]);
  }

  public function store(Request $request)
  {
    $validator = Validator::make($request->all(), ['ip_address' => 'required|ip', 'reason' => 'nullable|string']);
    if ($validator->fails())
      return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
    BlockedIp::firstOrCreate(['ip_address' => $request->ip_address], ['reason' => $request->reason, 'blocked_by_admin_id' => $request->user()->id]);
    return response()->json(['success' => true, 'message' => 'IP blocked.', 'data' => []], 201);
  }

  public function destroy(int $id)
  {
    BlockedIp::findOrFail($id)->delete();
    return response()->json(['success' => true, 'message' => 'IP unblocked.', 'data' => []]);
  }
}