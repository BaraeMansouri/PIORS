<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Events\StoreEventRequest;
use App\Models\Event;
use App\Models\EventRegistration;
use App\Notifications\PlatformNotification;
use Illuminate\Http\JsonResponse;

class EventController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Event::query()->latest()->get());
    }

    public function store(StoreEventRequest $request): JsonResponse
    {
        $event = Event::query()->create(array_merge(
            $request->validated(),
            ['created_by' => $request->user()?->getKey()]
        ));

        return response()->json($event, 201);
    }

    public function show(Event $event): JsonResponse
    {
        return response()->json($event->load('registrations'));
    }

    public function update(StoreEventRequest $request, Event $event): JsonResponse
    {
        $event->update($request->validated());

        return response()->json($event->fresh());
    }

    public function destroy(Event $event): JsonResponse
    {
        $event->delete();

        return response()->json(status: 204);
    }

    public function register(Event $event): JsonResponse
    {
        $user = request()->user();
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
