<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Internships\ApplyInternshipRequest;
use App\Http\Requests\Internships\StoreInternshipRequest;
use App\Models\Internship;
use App\Models\InternshipApplication;
use App\Notifications\PlatformNotification;
use Illuminate\Http\JsonResponse;

class InternshipController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Internship::query()->latest()->get());
    }

    public function store(StoreInternshipRequest $request): JsonResponse
    {
        $internship = Internship::query()->create(array_merge(
            $request->validated(),
            ['created_by' => $request->user()?->getKey()]
        ));

        return response()->json($internship, 201);
    }

    public function show(Internship $internship): JsonResponse
    {
        return response()->json($internship->load('applications'));
    }

    public function update(StoreInternshipRequest $request, Internship $internship): JsonResponse
    {
        $internship->update($request->validated());

        return response()->json($internship->fresh());
    }

    public function destroy(Internship $internship): JsonResponse
    {
        $internship->delete();

        return response()->json(status: 204);
    }

    public function apply(ApplyInternshipRequest $request, Internship $internship): JsonResponse
    {
        $application = InternshipApplication::query()->firstOrCreate([
            'internship_id' => $internship->getKey(),
            'student_id' => $request->user()->getKey(),
        ], [
            'motivation' => $request->validated('motivation'),
            'status' => 'pending',
            'applied_at' => now(),
        ]);

        $request->user()->notify(new PlatformNotification(
            'Candidature stage',
            'Votre candidature a ete envoyee.',
            ['internship_id' => $internship->getKey()]
        ));

        return response()->json($application, 201);
    }
}
