<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Users\ResetPasswordRequest;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Models\User;
use App\Services\PlatformNotificationService;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function __construct(
        protected PlatformNotificationService $notificationService,
    ) {
    }

    public function index(): JsonResponse
    {
        $students = User::query()
            ->where('role', UserRole::Stagiaire->value)
            ->with(['class', 'filiere'])
            ->latest()
            ->get();

        return response()->json($students);
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['role'] = UserRole::Stagiaire->value;
        $data['account_status'] = 'approved';
        $data['approved_at'] = now();

        $student = User::query()->create($data);

        return response()->json($student, 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->load(['class', 'filiere', 'grades', 'absences']));
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user->update($request->validated());

        return response()->json($user->fresh());
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json(status: 204);
    }

    public function trainers(): JsonResponse
    {
        return response()->json(
            User::query()->where('role', UserRole::Formateur->value)->latest()->get()
        );
    }

    public function storeTrainer(StoreUserRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['role'] = UserRole::Formateur->value;
        $data['account_status'] = 'approved';
        $data['approved_at'] = now();

        $trainer = User::query()->create($data);

        return response()->json($trainer, 201);
    }

    public function updateTrainer(UpdateUserRequest $request, User $user): JsonResponse
    {
        $user->update(array_merge($request->validated(), ['role' => UserRole::Formateur->value]));

        return response()->json($user->fresh());
    }

    public function resetPassword(ResetPasswordRequest $request, User $user): JsonResponse
    {
        $user->update([
            'password' => $request->validated('password'),
        ]);

        return response()->json([
            'message' => 'Password reset successfully.',
        ]);
    }

    public function approve(User $user): JsonResponse
    {
        $user->update([
            'account_status' => 'approved',
            'approved_at' => now(),
        ]);

        $this->notificationService->notifyUser(
            $user,
            'Compte valide',
            'Votre compte a ete valide par un administrateur. Vous pouvez maintenant vous connecter.',
            [
                'type' => 'account_approved',
            ]
        );

        return response()->json([
            'message' => 'Compte valide avec succes.',
        ]);
    }
}
