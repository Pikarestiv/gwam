<?php

use App\Http\Controllers\Api\Admin\AdminAnalyticsController;
use App\Http\Controllers\Api\Admin\AdminAuthController;
use App\Http\Controllers\Api\Admin\AdminBlockedIpController;
use App\Http\Controllers\Api\Admin\AdminDashboardController;
use App\Http\Controllers\Api\Admin\AdminMessageController;
use App\Http\Controllers\Api\Admin\AdminReportController;
use App\Http\Controllers\Api\Admin\AdminRevealInterestController;
use App\Http\Controllers\Api\Admin\AdminRoomController;
use App\Http\Controllers\Api\Admin\AdminSettingsController;
use App\Http\Controllers\Api\Admin\AdminUserController;
use App\Http\Controllers\Api\AnonymousMessageController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\EmailVerificationController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\RevealInterestController;
use App\Http\Controllers\Api\PublicUserController;
use App\Http\Controllers\Api\PushController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\StatsController;
use Illuminate\Support\Facades\Route;

/*
 |--------------------------------------------------------------------------
 | API Routes — api.gwam.dumostech.com/api/v1/
 |--------------------------------------------------------------------------
 */

Route::prefix('v1')->group(function () {

    // ─── Public Auth ───────────────────────────────────────────────────
    Route::prefix('auth')->group(function () {
            Route::post('register', [AuthController::class , 'register']);
            Route::post('login', [AuthController::class , 'login'])->middleware('throttle:10,1');
            Route::post('forgot-password', [AuthController::class , 'forgotPassword'])->middleware('throttle:5,1');
            Route::post('reset-password', [AuthController::class , 'resetPassword'])->middleware('throttle:5,1');
        }
        );

        // ─── Public User & Messaging ───────────────────────────────────────
        Route::get('users/{username}/profile', [PublicUserController::class , 'profile']);
        Route::post('users/{username}/nudge', [PublicUserController::class , 'nudge']);

        Route::middleware(['blocked.ip', 'rate.messages', 'content.filter'])
            ->post('users/{username}/messages', [AnonymousMessageController::class , 'send']);

        Route::post('messages/{messageId}/sender-interest', [AnonymousMessageController::class , 'saveSenderInterest']);
        Route::get('messages/reply/{senderToken}', [AnonymousMessageController::class , 'viewReply']);

        // ─── Public Rooms ──────────────────────────────────────────────────
        Route::get('rooms/{code}', [RoomController::class , 'show']);
        Route::middleware(['blocked.ip', 'throttle:15,1', 'content.filter'])
            ->post('rooms/{code}/messages', [RoomController::class , 'sendMessage']);

        // ─── Public Reports & Stats ────────────────────────────────────────
        Route::post('reports', [ReportController::class , 'store']);
        Route::get('payments/pricing', [PaymentController::class , 'pricing']);
        Route::post('webhooks/paystack', [PaymentController::class , 'webhook']);
        Route::get('push/key', [PushController::class , 'key']);
        Route::post('events', [EventController::class , 'store'])->middleware('throttle:120,1');
        Route::get('stats/public', [StatsController::class , 'public']);
    
        // ─── Authenticated ─────────────────────────────────────────────────
        Route::middleware('auth:sanctum')->group(function () {

            Route::prefix('auth')->group(function () {
                    Route::post('logout', [AuthController::class , 'logout']);
                    Route::post('verify-email', [EmailVerificationController::class , 'verify'])->middleware('throttle:5,1');
                    Route::post('resend-verification', [EmailVerificationController::class , 'resend']);
                    Route::get('me', [AuthController::class , 'me']);
                }
                );

                // Payments
                Route::post('payments/rooms', [PaymentController::class , 'startRoom'])->middleware(['verified.only', 'throttle:10,1']);
                Route::get('payments/{reference}', [PaymentController::class , 'verify']);

                // Web push
                Route::post('push/subscribe', [PushController::class , 'subscribe']);
                Route::delete('push/subscribe', [PushController::class , 'unsubscribe']);

                // Messages (inbox)
                Route::get('messages', [MessageController::class , 'index']);
                Route::patch('messages/{id}/read', [MessageController::class , 'markRead']);
                Route::post('messages/{id}/reply', [MessageController::class , 'reply']);
                Route::delete('messages/{id}', [MessageController::class , 'destroy']);

                // Rooms (authenticated management)
                Route::get('rooms', [RoomController::class , 'index']);
                Route::post('rooms', [RoomController::class , 'store']);
                Route::patch('rooms/{id}', [RoomController::class , 'update']);
                Route::delete('rooms/{id}', [RoomController::class , 'destroy']);
                Route::delete('rooms/{id}/messages', [RoomController::class , 'clearMessages']);
                Route::delete('rooms/{id}/messages/{msgId}', [RoomController::class , 'destroyMessage']);

                // Notifications
                Route::get('notifications', [NotificationController::class , 'index']);
                Route::get('notifications/unread-count', [NotificationController::class , 'unreadCount']);
                Route::patch('notifications/{id}/read', [NotificationController::class , 'markRead']);
                Route::patch('notifications/read-all', [NotificationController::class , 'markAllRead']);

                // Settings & Profile
                Route::get('settings', [SettingsController::class , 'show']);
                Route::patch('settings', [SettingsController::class , 'update']);
                Route::get('profile', [ProfileController::class , 'show']);
                Route::patch('profile', [ProfileController::class , 'update']);

                // Reveal interests
                Route::post('reveal-interests', [RevealInterestController::class , 'store']);
            }
            );

            // ─── Admin ─────────────────────────────────────────────────────────
            Route::prefix('admin')->group(function () {
            Route::post('auth/login', [AdminAuthController::class , 'login'])->middleware('throttle:10,1');

            Route::middleware('auth:admin-sanctum')->group(function () {
                    Route::post('auth/logout', [AdminAuthController::class , 'logout']);
                    Route::get('auth/me', [AdminAuthController::class , 'me']);

                    Route::get('dashboard/stats', [AdminDashboardController::class , 'stats']);
                    Route::get('dashboard/messages-chart', [AdminDashboardController::class , 'messagesChart']);
                    Route::get('dashboard/signups-chart', [AdminDashboardController::class , 'signupsChart']);
                    Route::get('dashboard/top-recipients', [AdminDashboardController::class , 'topRecipients']);
                    Route::get('dashboard/top-rooms', [AdminDashboardController::class , 'topRooms']);

                    Route::get('analytics', [AdminAnalyticsController::class , 'summary']);

                    Route::get('users', [AdminUserController::class , 'index']);
                    Route::get('users/{id}', [AdminUserController::class , 'show']);
                    Route::patch('users/{id}/suspend', [AdminUserController::class , 'suspend']);
                    Route::patch('users/{id}/unsuspend', [AdminUserController::class , 'unsuspend']);
                    Route::delete('users/{id}', [AdminUserController::class , 'destroy']);
                    Route::patch('users/{id}/force-verify', [AdminUserController::class , 'forceVerify']);

                    Route::get('messages/flagged', [AdminMessageController::class , 'flagged']);
                    Route::patch('messages/{id}/approve', [AdminMessageController::class , 'approve']);
                    Route::delete('messages/{id}', [AdminMessageController::class , 'destroy']);

                    Route::get('reports', [AdminReportController::class , 'index']);
                    Route::patch('reports/{id}', [AdminReportController::class , 'update']);

                    Route::get('rooms', [AdminRoomController::class , 'index']);
                    Route::delete('rooms/{id}', [AdminRoomController::class , 'destroy']);

                    Route::get('blocked-ips', [AdminBlockedIpController::class , 'index']);
                    Route::post('blocked-ips', [AdminBlockedIpController::class , 'store']);
                    Route::delete('blocked-ips/{id}', [AdminBlockedIpController::class , 'destroy']);

                    Route::get('reveal-interests/count', [AdminRevealInterestController::class , 'count']);

                    Route::get('settings', [AdminSettingsController::class , 'show']);
                    Route::patch('settings', [AdminSettingsController::class , 'update']);
                }
                );
            }
            );
        });