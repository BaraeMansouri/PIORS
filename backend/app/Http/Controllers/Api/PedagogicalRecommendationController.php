<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Recommendations\StorePedagogicalRecommendationRequest;
use App\Models\PedagogicalRecommendation;
use App\Services\PlatformNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PedagogicalRecommendationController extends Controller
{
    public function __construct(
        protected PlatformNotificationService $notificationService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = PedagogicalRecommendation::query()
            ->with(['student.class', 'student.filiere', 'trainer'])
            ->latest();

        if ($request->user()?->role === UserRole::Stagiaire->value) {
            $query->where('student_id', $request->user()->getKey());
        } elseif ($request->filled('student_id')) {
            $query->where('student_id', $request->integer('student_id'));
        }

        return response()->json($query->get());
    }

    public function store(StorePedagogicalRecommendationRequest $request): JsonResponse
    {
        $recommendation = PedagogicalRecommendation::query()->create(array_merge(
            $request->validated(),
            [
                'trainer_id' => $request->user()?->getKey(),
                'priority' => $request->validated('priority') ?? 'medium',
                'status' => $request->validated('status') ?? 'open',
            ]
        ));

        $recommendation->load(['student', 'trainer']);

        $this->notificationService->notifyUser(
            $recommendation->student,
            'Nouvelle recommandation pedagogique',
            $recommendation->title,
            [
                'type' => 'pedagogical_recommendation',
                'recommendation_id' => $recommendation->id,
                'priority' => $recommendation->priority,
            ]
        );

        return response()->json($recommendation, 201);
    }

    public function update(Request $request, PedagogicalRecommendation $recommendation): JsonResponse
    {
        $data = $request->validate([
            'status' => ['nullable', 'in:open,done'],
            'priority' => ['nullable', 'in:low,medium,high'],
            'title' => ['nullable', 'string', 'max:160'],
            'message' => ['nullable', 'string'],
            'due_at' => ['nullable', 'date'],
        ]);

        $recommendation->update($data);

        return response()->json($recommendation->fresh()->load(['student', 'trainer']));
    }

    public function destroy(PedagogicalRecommendation $recommendation): JsonResponse
    {
        $recommendation->delete();

        return response()->json(status: 204);
    }
}
