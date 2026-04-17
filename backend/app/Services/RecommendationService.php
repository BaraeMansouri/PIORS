<?php

namespace App\Services;

use App\Models\Course;
use App\Models\User;

class RecommendationService
{
    public function forStudent(User $student)
    {
        $query = Course::query();

        if ($student->filiere_id) {
            $query->where(function ($builder) use ($student) {
                $builder
                    ->where('filiere_id', $student->filiere_id)
                    ->orWhereNull('filiere_id');
            });
        }

        if (($student->average_grade ?? 0) < 10) {
            $query->orderByDesc('support_priority');
        } else {
            $query->latest();
        }

        return $query->limit(5)->get();
    }
}
