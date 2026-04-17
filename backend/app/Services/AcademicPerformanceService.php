<?php

namespace App\Services;

use App\Models\Absence;
use App\Models\Grade;
use App\Models\User;

class AcademicPerformanceService
{
    public function refreshStudentStats(User $student): User
    {
        $grades = Grade::query()->where('student_id', $student->getKey())->get();
        $weightedTotal = $grades->sum(fn (Grade $grade) => $grade->score * ($grade->coefficient ?? 1));
        $coefficients = max(1, (float) $grades->sum(fn (Grade $grade) => $grade->coefficient ?? 1));
        $average = $grades->isEmpty() ? 0 : $weightedTotal / $coefficients;
        $absences = Absence::query()->where('student_id', $student->getKey())->count();

        $student->forceFill([
            'average_grade' => round($average, 2),
            'absence_count' => $absences,
        ])->save();

        return $student->fresh();
    }
}