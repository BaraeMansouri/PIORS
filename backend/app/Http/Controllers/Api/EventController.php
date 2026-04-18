<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Events\StoreEventRequest;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Services\PlatformNotificationService;
use App\Notifications\PlatformNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class EventController extends Controller
{
    public function __construct(
        protected PlatformNotificationService $notificationService,
    ) {
    }

    public function index(): JsonResponse
    {
        $user = request()->user();

        $events = Event::query()
            ->withCount('registrations')
            ->withExists([
                'registrations as is_registered' => fn ($query) => $query->where('student_id', $user?->getKey()),
            ])
            ->latest()
            ->get();

        return response()->json($events);
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        if (! $request->user()?->isAdmin() && ! $request->user()?->isTrainer()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $data = $request->validated();

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('events/images', 'public');
        }

        $event = Event::query()->create(array_merge(
            $data,
            ['created_by' => $request->user()?->getKey()]
        ));

        $this->notificationService->notifyRoles(
            ['admin', 'formateur', 'stagiaire'],
            'Nouvel event publie',
            "L'event {$event->title} est maintenant disponible.",
            [
                'type' => 'event_created',
                'event_id' => $event->id,
                'title' => $event->title,
            ]
        );

        return response()->json($event, 201);
    }

    public function show(Event $event): JsonResponse
    {
        return response()->json($event->load('registrations'));
    }

    public function update(StoreEventRequest $request, Event $event): JsonResponse
    {
        if (
            ! $request->user()?->isAdmin()
            && (string) $event->created_by !== (string) $request->user()?->getKey()
        ) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $data = $request->validated();

        if ($request->hasFile('image')) {
            if ($event->image_path) {
                Storage::disk('public')->delete($event->image_path);
            }

            $data['image_path'] = $request->file('image')->store('events/images', 'public');
        }

        $event->update($data);

        return response()->json($event->fresh());
    }

    public function destroy(Event $event): JsonResponse
    {
        if (
            ! request()->user()?->isAdmin()
            && (string) $event->created_by !== (string) request()->user()?->getKey()
        ) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        if ($event->image_path) {
            Storage::disk('public')->delete($event->image_path);
        }

        $event->delete();

        return response()->json(status: 204);
    }

    public function register(Event $event): JsonResponse
    {
        $user = request()->user();

        if (! $user?->isStudent()) {
            return response()->json(['message' => 'Only students can register.'], 403);
        }

        $registrationsCount = EventRegistration::query()->where('event_id', $event->getKey())->count();

        if ($registrationsCount >= $event->capacity) {
            return response()->json(['message' => 'Event is full.'], 422);
        }

        $registration = EventRegistration::query()->firstOrCreate([
            'event_id' => $event->getKey(),
            'student_id' => $user->getKey(),
        ], [
            'registered_at' => now(),
        ]);

        $user->notify(new PlatformNotification(
            'Inscription evenement',
            'Votre inscription a ete prise en compte.',
            ['event_id' => $event->getKey()]
        ));

        return response()->json($registration, 201);
    }
}
