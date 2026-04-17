<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Absences\StoreAbsenceRequest;
use App\Models\Absence;
use App\Models\User;
use App\Services\AcademicPerformanceService;
use Illuminate\Http\JsonResponse;

class AbsenceController extends Controller
{
    public function __construct(protected AcademicPerformanceService $performanceService)
    {
    }

    public function index(): JsonResponse
    {
        return response()->json(Absence::query()->with(['student', 'course'])->latest()->get());
    }

    public function store(StoreAbsenceRequest $request): JsonResponse
    {
        $absence = Absence::query()->create(array_merge(
            $request->validated(),
            ['recorded_by' => $request->user()?->getKey()]
        ));

        if ($student = User::query()->find($absence->student_id)) {
            $this->performanceService->refreshStudentStats($student);
        }

        return response()->json($absence, 201);
    }

    public function show(Absence $absence): JsonResponse
    {
        return response()->json($absence->load(['student', 'course']));
    }

    public function update(StoreAbsenceRequest $request, Absence $absence): JsonResponse
    {
        $absence->update($request->validated());

        if ($student = User::query()->find($absence->student_id)) {
            $this->performanceService->refreshStudentStats($student);
        }

        return response()->json($absence->fresh());
    }

    public function destroy(Absence $absence): JsonResponse
    {
        $studentId = $absence->student_id;
        $absence->delete();

        if ($student = User::query()->find($studentId)) {
            $this->performanceService->refreshStudentStats($student);
        }

        return response()->json(status: 204);
    }
}
