<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(request()->user()->notifications);
    }

    public function markAsRead(string $id): JsonResponse
    {
        $notification = request()->user()->notifications()->where('id', $id)->firstOrFail();
        $notification->markAsRead();

        return response()->json([
            'message' => 'Notification marked as read.',
        ]);
    }
}
