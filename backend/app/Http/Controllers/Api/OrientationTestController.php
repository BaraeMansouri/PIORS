<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Orientation\StoreOrientationQuestionRequest;
use App\Http\Requests\Orientation\StoreOrientationTestRequest;
use App\Http\Requests\Orientation\SubmitOrientationRequest;
use App\Models\Filiere;
use App\Models\OrientationQuestion;
use App\Models\OrientationResult;
use App\Models\OrientationTest;
use App\Models\User;
use App\Services\OrientationService;
use App\Services\PlatformNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrientationTestController extends Controller
{
    public function __construct(
        protected OrientationService $orientationService,
        protected PlatformNotificationService $notificationService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = OrientationTest::query()->with('questions');

        if ($request->user()?->role !== UserRole::Admin->value) {
            $query->where('is_active', true);
        }

        return response()->json($query->latest()->get());
    }

    public function store(StoreOrientationTestRequest $request): JsonResponse
    {
        $test = OrientationTest::query()->create(array_merge(
            ['is_active' => true],
            $request->validated()
        ));

        return response()->json($test->load('questions'), 201);
    }

    public function update(StoreOrientationTestRequest $request, OrientationTest $orientationTest): JsonResponse
    {
        $orientationTest->update($request->validated());

        return response()->json($orientationTest->fresh()->load('questions'));
    }

    public function destroy(OrientationTest $orientationTest): JsonResponse
    {
        $orientationTest->delete();

        return response()->json(status: 204);
    }

    public function storeQuestion(StoreOrientationQuestionRequest $request, OrientationTest $orientationTest): JsonResponse
    {
        $question = $orientationTest->questions()->create($this->questionPayload($request));

        return response()->json($question, 201);
    }

    public function updateQuestion(StoreOrientationQuestionRequest $request, OrientationQuestion $orientationQuestion): JsonResponse
    {
        $orientationQuestion->update($this->questionPayload($request));

        return response()->json($orientationQuestion->fresh());
    }

    public function destroyQuestion(OrientationQuestion $orientationQuestion): JsonResponse
    {
        $orientationQuestion->delete();

        return response()->json(status: 204);
    }

    public function submit(SubmitOrientationRequest $request, OrientationTest $orientationTest): JsonResponse
    {
        $student = $this->targetStudent($request);
        $result = $this->orientationService->evaluate(
            $student,
            $orientationTest->load('questions'),
            $request->validated('answers')
        );

        if ($result->recommendedFiliere) {
            $this->notificationService->notifyUser(
                $student,
                'Resultat orientation disponible',
                "Votre filiere recommandee est {$result->recommendedFiliere->name} avec {$result->confidence}% de confiance.",
                [
                    'type' => 'orientation_result',
                    'result_id' => $result->id,
                    'filiere' => $result->recommendedFiliere->name,
                ]
            );
        }

        return response()->json($result->load(['test.questions', 'recommendedFiliere', 'student']));
    }

    public function results(Request $request): JsonResponse
    {
        $query = OrientationResult::query()->with(['test', 'student.class', 'recommendedFiliere'])->latest();

        if ($request->user()?->role === UserRole::Stagiaire->value) {
            $query->where('student_id', $request->user()->getKey());
        } elseif ($request->filled('student_id')) {
            $query->where('student_id', $request->integer('student_id'));
        }

        return response()->json($query->limit(40)->get());
    }

    public function resources(Request $request): JsonResponse
    {
        $students = User::query()
            ->where('role', UserRole::Stagiaire->value)
            ->with(['class', 'filiere'])
            ->orderBy('name');

        if ($request->user()?->role === UserRole::Stagiaire->value) {
            $students->whereKey($request->user()->getKey());
        }

        return response()->json([
            'filieres' => Filiere::query()->orderBy('name')->get(),
            'students' => $students->get(),
        ]);
    }

    private function questionPayload(StoreOrientationQuestionRequest $request): array
    {
        $data = $request->validated();
        $data['options'] = $data['options'] ?? [
            ['label' => 'Peu', 'value' => 10],
            ['label' => 'Moyennement', 'value' => 20],
            ['label' => 'Beaucoup', 'value' => 30],
        ];

        return $data;
    }

    private function targetStudent(SubmitOrientationRequest $request): User
    {
        $user = $request->user();

        if ($request->filled('student_id') && in_array($user?->role, [UserRole::Admin->value, UserRole::Formateur->value], true)) {
            return User::query()->findOrFail($request->integer('student_id'));
        }

        return $user;
    }
}
