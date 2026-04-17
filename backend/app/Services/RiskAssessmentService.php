<?php

namespace App\Services;

use App\Models\User;

class RiskAssessmentService
{
    public function evaluate(User $student, int $absenceThreshold = 8): array
    {
        $average = (float) ($student->average_grade ?? 0);
        $absences = (int) ($student->absence_count ?? 0);

        $atRisk = $average < 10 || $absences > $absenceThreshold;

        return [
            'at_risk' => $atRisk,
            'average_grade' => $average,
            'absence_count' => $absences,
            'absence_threshold' => $absenceThreshold,
            'reason' => $atRisk
                ? ($average < 10 ? 'average_below_threshold' : 'absence_above_threshold')
                : 'stable',
        ];
    }
}
