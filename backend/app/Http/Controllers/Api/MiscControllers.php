<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RevealInterest;
use App\Models\Report;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'success' => true,
            'message' => 'Settings retrieved.',
            'data'    => [
                'theme_preference'         => $user->theme_preference,
                'message_retention_months' => $user->message_retention_months,
                'bio'                      => $user->bio,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'theme_preference'         => 'sometimes|in:gwam_dark,neon_magenta,soft_dark',
            'message_retention_months' => 'sometimes|in:1,3,6,12',
            'bio'                      => 'sometimes|nullable|string|max:200',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $request->user()->update($request->only([
            'theme_preference', 'message_retention_months', 'bio',
        ]));

        return response()->json([
            'success' => true,
            'message' => 'Settings updated.',
            'data'    => [],
        ]);
    }
}

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user();
        return response()->json([
            'success' => true,
            'message' => 'Profile retrieved.',
            'data'    => [
                'id'          => $user->id,
                'name'        => $user->name,
                'username'    => $user->username,
                'email'       => $user->email,
                'avatar_seed' => $user->avatar_seed,
                'bio'         => $user->bio,
                'inbox_active'=> $user->inbox_active,
                'is_verified' => $user->isVerified(),
            ],
        ]);
    }

    public function update(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name'        => 'sometimes|string|max:100',
            'bio'         => 'sometimes|nullable|string|max:200',
            'avatar_seed' => 'sometimes|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        $request->user()->update($request->only(['name', 'bio', 'avatar_seed']));

        return response()->json([
            'success' => true,
            'message' => 'Profile updated.',
            'data'    => [],
        ]);
    }
}

class RevealInterestController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message_id' => 'required|exists:messages,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        RevealInterest::firstOrCreate([
            'message_id'         => $request->message_id,
            'requester_user_id'  => $request->user()->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => "You're on the waitlist! We'll notify you when reveal hints launch.",
            'data'    => [],
        ]);
    }
}

class ReportController extends Controller
{
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'message_id'      => 'nullable|exists:messages,id',
            'room_message_id' => 'nullable|exists:room_messages,id',
            'reason'          => 'required|in:harassment,threats,explicit,spam,other',
            'extra_detail'    => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422);
        }

        Report::create([
            'message_id'       => $request->message_id,
            'room_message_id'  => $request->room_message_id,
            'reporter_user_id' => $request->user()?->id,
            'reporter_ip'      => $request->ip(),
            'reason'           => $request->reason,
            'extra_detail'     => $request->extra_detail,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Report submitted. Our team will review it.',
            'data'    => [],
        ]);
    }
}

class StatsController extends Controller
{
    public function public()
    {
        $count = Message::where('is_deleted', false)->count();

        return response()->json([
            'success' => true,
            'message' => 'Stats retrieved.',
            'data'    => ['total_messages' => $count],
        ]);
    }
}