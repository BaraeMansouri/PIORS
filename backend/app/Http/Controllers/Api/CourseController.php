<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Courses\StoreCourseRequest;
use App\Models\Course;
use App\Services\PlatformNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class CourseController extends Controller
{
    public function __construct(
        protected PlatformNotificationService $notificationService,
    ) {
    }

    public function index(): JsonResponse
    {
        return response()->json(Course::query()->with(['class', 'filiere', 'trainer'])->latest()->get());
    }

    public function store(StoreCourseRequest $request): JsonResponse
    {
        if (! $request->user()?->isAdmin() && ! $request->user()?->isTrainer()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $data = $request->validated();
        $data['trainer_id'] = $data['trainer_id'] ?? $request->user()?->getKey();

        if ($request->hasFile('pdf')) {
            $data['pdf_path'] = $request->file('pdf')->store('courses', 'public');
        }

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('courses/images', 'public');
        }

        $course = Course::query()->create($data);

        $this->notificationService->notifyRoles(
            ['admin', 'formateur', 'stagiaire'],
            'Nouveau cours publie',
            "Le cours {$course->title} vient d'etre publie sur la plateforme.",
            [
                'type' => 'course_created',
                'course_id' => $course->id,
                'title' => $course->title,
            ]
        );

        return response()->json($course->load(['class', 'filiere', 'trainer']), 201);
    }

    public function show(Course $course): JsonResponse
    {
        return response()->json($course->load(['class', 'filiere', 'trainer']));
    }

    public function update(StoreCourseRequest $request, Course $course): JsonResponse
    {
        if (
            ! $request->user()?->isAdmin()
            && (string) $course->trainer_id !== (string) $request->user()?->getKey()
        ) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $data = $request->validated();

        if ($request->hasFile('pdf')) {
            if ($course->pdf_path) {
                Storage::disk('public')->delete($course->pdf_path);
            }

            $data['pdf_path'] = $request->file('pdf')->store('courses', 'public');
        }

        if ($request->hasFile('image')) {
            if ($course->image_path) {
                Storage::disk('public')->delete($course->image_path);
            }

            $data['image_path'] = $request->file('image')->store('courses/images', 'public');
        }

        $course->update($data);

        return response()->json($course->fresh()->load(['class', 'filiere', 'trainer']));
    }

    public function destroy(Course $course): JsonResponse
    {
        if (
            ! request()->user()?->isAdmin()
            && (string) $course->trainer_id !== (string) request()->user()?->getKey()
        ) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($course->pdf_path) {
            Storage::disk('public')->delete($course->pdf_path);
        }

        if ($course->image_path) {
            Storage::disk('public')->delete($course->image_path);
        }

        $course->delete();

        return response()->json(status: 204);
    }
}
