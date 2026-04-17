<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\AssignStudentsRequest;
use App\Http\Requests\Academic\StoreClassRequest;
use App\Models\AcademicClass;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class AcademicClassController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(AcademicClass::query()->with('filiere')->latest()->get());
    }

    public function store(StoreClassRequest $request): JsonResponse
    {
        $class = AcademicClass::query()->create($request->validated());

        return response()->json($class, 201);
    }

    public function show(AcademicClass $academicClass): JsonResponse
    {
        return response()->json($academicClass->load(['filiere', 'students']));
    }

    public function update(StoreClassRequest $request, AcademicClass $academicClass): JsonResponse
    {
        $academicClass->update($request->validated());

        return response()->json($academicClass->fresh());
    }

    public function destroy(AcademicClass $academicClass): JsonResponse
    {
        $academicClass->delete();

        return response()->json(status: 204);
    }

    public function assignStudents(AssignStudentsRequest $request, AcademicClass $academicClass): JsonResponse
    {
        User::query()
            ->whereIn('id', $request->validated('student_ids'))
            ->update([
                'class_id' => $academicClass->getKey(),
                'filiere_id' => $academicClass->filiere_id,
            ]);

        return response()->json([
            'message' => 'Students assigned successfully.',
        ]);
    }
}