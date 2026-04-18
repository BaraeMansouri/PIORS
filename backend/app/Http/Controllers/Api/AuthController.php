<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Models\User;
use App\Services\PlatformNotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

class AuthController extends Controller
{
    public function __construct(
        protected PlatformNotificationService $notificationService,
    ) {
    }

    private function formatUser(User $user): array
    {
        $user->loadMissing(['class', 'filiere']);
        $data = $user->toArray();

        if (is_string($user->avatar) && str_starts_with($user->avatar, 'data:') && strlen($user->avatar) > 5000) {
            $data['avatar'] = null;
        } elseif (is_string($user->avatar) && $user->avatar !== '' && ! str_starts_with($user->avatar, 'http') && ! str_starts_with($user->avatar, 'data:')) {
            $data['avatar'] = url(Storage::url($user->avatar));
        }

        $data['className'] = $user->class?->name;
        $data['filiere'] = $user->filiere?->name;

        return $data;
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['role'] = $data['role'] ?? UserRole::Stagiaire->value;
        $data['account_status'] = $data['role'] === UserRole::Admin->value ? 'approved' : 'pending';
        $data['approved_at'] = $data['account_status'] === 'approved' ? now() : null;

        $user = User::query()->create($data);
        $token = $user->account_status === 'approved'
            ? $user->createToken($request->input('device_name', 'web'))->plainTextToken
            : null;

        if ($user->account_status === 'pending') {
            $this->notificationService->notifyAdmins(
                'Nouvelle inscription a valider',
                "{$user->name} a cree un compte {$user->role} et attend la validation admin.",
                [
                    'type' => 'account_validation',
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'user_role' => $user->role,
                ]
            );
        }

        return response()->json([
            'message' => $user->account_status === 'pending'
                ? 'Compte cree. En attente de validation par un administrateur.'
                : 'User registered successfully.',
            'user' => $this->formatUser($user),
            'token' => $token,
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $email = $request->string('email')->toString();
        $password = $request->string('password')->toString();

        $user = User::query()->where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 422);
        }

        if (! $user->isApproved()) {
            return response()->json([
                'message' => 'Votre compte est en attente de validation par un administrateur.',
            ], 403);
        }

        $token = $user->createToken($request->input('device_name', 'web'))->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'user' => $this->formatUser($user),
            'token' => $token,
        ]);
    }

    public function me(): JsonResponse
    {
        return response()->json($this->formatUser(request()->user()));
    }

    public function updateProfile(UpdateUserRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        if ($request->hasFile('avatar')) {
            if ($user->avatar && ! str_starts_with($user->avatar, 'data:') && ! str_starts_with($user->avatar, 'http')) {
                Storage::disk('public')->delete($user->avatar);
            }

            $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
        }

        $user->update($data);

        return response()->json($this->formatUser($user->fresh()));
    }

    public function logout(): JsonResponse
    {
        request()->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
