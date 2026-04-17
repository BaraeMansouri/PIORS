<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Courses\StoreCourseRequest;
use App\Models\Course;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Course::query()->with(['class', 'filiere', 'trainer'])->latest()->get());
    }

    public function store(StoreCourseRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['trainer_id'] = $data['trainer_id'] ?? $request->user()?->getKey();

        if ($request->hasFile('pdf')) {
            $data['pdf_path'] = $request->file('pdf')->store('courses', 'public');
        }

        $course = Course::query()->create($data);

        return response()->json($course, 201);
    }

    public function show(Course $course): JsonResponse
    {
        return response()->json($course->load(['class', 'filiere', 'trainer']));
    }

    public function update(StoreCourseRequest $request, Course $course): JsonResponse
    {
        $data = $request->validated();

        if ($request->hasFile('pdf')) {
            if ($course->pdf_path) {
                Storage::disk('public')->delete($course->pdf_path);
            }

            $data['pdf_path'] = $request->file('pdf')->store('courses', 'public');
        }

        $course->update($data);

        return response()->json($course->fresh());
    }

    public function destroy(Course $course): JsonResponse
    {
        if ($course->pdf_path) {
            Storage::disk('public')->delete($course->pdf_path);
        }

        $course->delete();

        return response()->json(status: 204);
    }
}
