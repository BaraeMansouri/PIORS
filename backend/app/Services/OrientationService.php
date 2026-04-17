<?php

namespace App\Services;

use App\Models\Filiere;
use App\Models\User;

class OrientationService
{
    public function suggestFiliere(float $score): ?Filiere
    {
        return Filiere::query()
            ->where('minimum_orientation_score', '<=', $score)
            ->orderByDesc('minimum_orientation_score')
            ->first();
    }

    public function apply(User $student, float $score): User
    {
        $filiere = $this->suggestFiliere($score);

        $student->forceFill([
            'orientation_score' => $score,
            'filiere_id' => $filiere?->getKey(),
        ])->save();

        return $student->fresh();
    }
}
