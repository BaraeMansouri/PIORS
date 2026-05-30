<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Grades\StoreGradeRequest;
use App\Models\Grade;
use App\Models\User;
use App\Services\AcademicPerformanceService;
use App\Services\PlatformNotificationService;
use Illuminate\Http\JsonResponse;

class GradeController extends Controller
{
    public function __construct(
        protected AcademicPerformanceService $performanceService,
        protected PlatformNotificationService $notificationService,
    ) {
    }

    public function index(): JsonResponse
    {
        return response()->json(Grade::query()->with(['student', 'course'])->latest()->get());
    }

    public function store(StoreGradeRequest $request): JsonResponse
    {
        $grade = Grade::query()->create(array_merge(
            $request->validated(),
            ['trainer_id' => $request->user()?->getKey()]
        ));

        $student = User::query()->find($grade->student_id);
        if ($student) {
            $this->performanceService->refreshStudentStats($student);
            $this->notifyIfGradeRisk($student->fresh(), $grade);
        }

        return response()->json($grade, 201);
    }

    public function show(Grade $grade): JsonResponse
    {
        return response()->json($grade->load(['student', 'course']));
    }

    public function update(StoreGradeRequest $request, Grade $grade): JsonResponse
    {
        $grade->update($request->validated());

        if ($student = User::query()->find($grade->student_id)) {
            $this->performanceService->refreshStudentStats($student);
            $this->notifyIfGradeRisk($student->fresh(), $grade);
        }

        return response()->json($grade->fresh());
    }

    public function destroy(Grade $grade): JsonResponse
    {
        $studentId = $grade->student_id;
        $grade->delete();

        if ($student = User::query()->find($studentId)) {
            $this->performanceService->refreshStudentStats($student);
        }

        return response()->json(status: 204);
    }

    private function notifyIfGradeRisk(User $student, Grade $grade): void
    {
        if ((float) $grade->score >= 10 && (float) ($student->average_grade ?? 0) >= 10) {
            return;
        }

        $this->notificationService->notifyUser(
            $student,
            'Alerte baisse de notes',
            "Une note de {$grade->score}/20 ou une moyenne faible demande un plan de soutien.",
            [
                'type' => 'grade_alert',
                'student_id' => $student->id,
                'grade_id' => $grade->id,
                'score' => $grade->score,
                'average_grade' => $student->average_grade,
            ]
        );

        $this->notificationService->notifyRoles(
            ['admin', 'formateur'],
            'Alerte performance stagiaire',
            "{$student->name} presente une note ou moyenne sous le seuil.",
            [
                'type' => 'grade_alert',
                'student_id' => $student->id,
                'student_name' => $student->name,
                'average_grade' => $student->average_grade,
            ]
        );
    }
}
