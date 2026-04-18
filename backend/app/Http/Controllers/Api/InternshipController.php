<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Internships\ApplyInternshipRequest;
use App\Http\Requests\Internships\StoreInternshipRequest;
use App\Models\Internship;
use App\Models\InternshipApplication;
use App\Notifications\PlatformNotification;
use App\Services\PlatformNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class InternshipController extends Controller
{
    public function __construct(
        protected PlatformNotificationService $notificationService,
    ) {
    }

    public function index(): JsonResponse
    {
        $user = request()->user();

        $internships = Internship::query()
            ->withCount('applications')
            ->withExists([
                'applications as has_applied' => fn ($query) => $query->where('student_id', $user?->getKey()),
            ])
            ->latest()
            ->get();

        return response()->json($internships);
    }

    public function store(StoreInternshipRequest $request): JsonResponse
    {
        if (! $request->user()?->isAdmin() && ! $request->user()?->isTrainer()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('internships/images', 'public');
        }

        $internship = Internship::query()->create(array_merge(
            $data,
            ['created_by' => $request->user()?->getKey()]
        ));

        $this->notificationService->notifyRoles(
            ['admin', 'formateur', 'stagiaire'],
            'Nouveau stage publie',
            "Le stage {$internship->title} chez {$internship->company} est disponible.",
            [
                'type' => 'internship_created',
                'internship_id' => $internship->id,
                'title' => $internship->title,
            ]
        );

        return response()->json($internship, 201);
    }

    public function show(Internship $internship): JsonResponse
    {
        return response()->json($internship->load('applications'));
    }

    public function update(StoreInternshipRequest $request, Internship $internship): JsonResponse
    {
        if (
            ! $request->user()?->isAdmin()
            && (string) $internship->created_by !== (string) $request->user()?->getKey()
        ) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($internship->image_path) {
                Storage::disk('public')->delete($internship->image_path);
            }

            $data['image_path'] = $request->file('image')->store('internships/images', 'public');
        }

        $internship->update($data);

        return response()->json($internship->fresh());
    }

    public function destroy(Internship $internship): JsonResponse
    {
        if (
            ! request()->user()?->isAdmin()
            && (string) $internship->created_by !== (string) request()->user()?->getKey()
        ) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($internship->image_path) {
            Storage::disk('public')->delete($internship->image_path);
        }

        $internship->delete();

        return response()->json(status: 204);
    }

    public function apply(ApplyInternshipRequest $request, Internship $internship): JsonResponse
    {
        if (! $request->user()->isStudent()) {
            return response()->json(['message' => 'Only students can apply.'], 403);
        }

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
