<?php

namespace App\Services;

use App\Enums\UserRole;
use App\Models\User;
use App\Notifications\PlatformNotification;
use Illuminate\Support\Collection;

class PlatformNotificationService
{
    public function notifyAdmins(string $title, string $message, array $context = []): void
    {
        $this->usersByRole([UserRole::Admin->value])->each(
            fn (User $user) => $this->send($user, $title, $message, $context)
        );
    }

    public function notifyTrainers(string $title, string $message, array $context = []): void
    {
        $this->usersByRole([UserRole::Formateur->value])->each(
            fn (User $user) => $this->send($user, $title, $message, $context)
        );
    }

    public function notifyStudents(string $title, string $message, array $context = []): void
    {
        $this->usersByRole([UserRole::Stagiaire->value])->each(
            fn (User $user) => $this->send($user, $title, $message, $context)
        );
    }

    public function notifyUser(User $user, string $title, string $message, array $context = []): void
    {
        $this->send($user, $title, $message, $context);
    }

    public function notifyRoles(array $roles, string $title, string $message, array $context = []): void
    {
        $this->usersByRole($roles)->each(
            fn (User $user) => $this->send($user, $title, $message, $context)
        );
    }

    private function usersByRole(array $roles): Collection
    {
        return User::query()
            ->whereIn('role', $roles)
            ->where('account_status', 'approved')
            ->get();
    }

    private function send(User $user, string $title, string $message, array $context = []): void
    {
        $user->notify(new PlatformNotification($title, $message, $context));
    }
}
