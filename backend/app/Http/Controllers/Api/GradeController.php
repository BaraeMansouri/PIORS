<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Grades\StoreGradeRequest;
use App\Models\Grade;
use App\Models\User;
use App\Services\AcademicPerformanceService;
use Illuminate\Http\JsonResponse;

class GradeController extends Controller
{
    public function __construct(protected AcademicPerformanceService $performanceService)
    {
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
}
