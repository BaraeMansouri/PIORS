<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AiAssistantService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AiController extends Controller
{
    public function __construct(
        protected AiAssistantService $assistantService,
    ) {
    }

    public function chat(Request $request): JsonResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:1200'],
            'history' => ['nullable', 'array'],
            'history.*.type' => ['nullable', 'string', 'max:20'],
            'history.*.text' => ['nullable', 'string', 'max:1200'],
        ]);

        return response()->json(
            $this->assistantService->chat($request->user(), $data['message'], $data['history'] ?? [])
        );
    }

    public function recommendation(User $student): JsonResponse
    {
        return response()->json($this->assistantService->recommendationFor($student));
    }
}
