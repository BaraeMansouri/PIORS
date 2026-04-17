<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Insights\OrientStudentRequest;
use App\Models\User;
use App\Services\OrientationService;
use App\Services\RecommendationService;
use App\Services\RiskAssessmentService;
use Illuminate\Http\JsonResponse;

class StudentInsightController extends Controller
{
    public function __construct(
        protected OrientationService $orientationService,
        protected RiskAssessmentService $riskAssessmentService,
        protected RecommendationService $recommendationService,
    ) {
    }

    public function show(User $student): JsonResponse
    {
        return response()->json([
            'student' => $student->load(['class', 'filiere']),
            'risk' => $this->riskAssessmentService->evaluate(
                $student,
                (int) config('app.absence_risk_threshold', env('ABSENCE_RISK_THRESHOLD', 8))
            ),
            'recommendations' => $this->recommendationService->forStudent($student),
        ]);
    }

    public function orient(OrientStudentRequest $request, User $student): JsonResponse
    {
        $student = $this->orientationService->apply($student, (float) $request->validated('score'));

        return response()->json([
            'message' => 'Orientation updated successfully.',
            'student' => $student->load('filiere'),
        ]);
    }
}
