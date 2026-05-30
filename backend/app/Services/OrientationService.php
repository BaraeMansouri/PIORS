<?php

namespace App\Services;

use App\Models\Filiere;
use App\Models\OrientationResult;
use App\Models\OrientationTest;
use App\Models\User;
use Illuminate\Support\Collection;

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

    public function evaluate(User $student, OrientationTest $test, array $answers): OrientationResult
    {
        $questions = $test->questions;
        $answersByQuestion = collect($answers)->keyBy('question_id');
        $filieres = Filiere::query()->orderBy('minimum_orientation_score')->get();
        $filiereScores = $filieres->mapWithKeys(fn (Filiere $filiere) => [$filiere->code => 0.0])->all();
        $normalizedAnswers = [];
        $total = 0.0;
        $max = max(1, $questions->count() * 30);

        foreach ($questions as $question) {
            $answer = $answersByQuestion->get($question->id, []);
            $value = (float) ($answer['value'] ?? 0);
            $total += $value;

            $normalizedAnswers[] = [
                'question_id' => $question->id,
                'question' => $question->question,
                'skill_key' => $question->skill_key,
                'label' => $answer['label'] ?? null,
                'value' => $value,
            ];

            foreach ($filieres as $filiere) {
                $weight = $this->skillWeight($filiere, $question->skill_key);
                $filiereScores[$filiere->code] += $value * $weight;
            }
        }

        $totalScore = round(($total / $max) * 100, 2);
        $recommended = $this->bestFiliere($filieres, $filiereScores, $totalScore);
        $bestScore = $recommended ? ($filiereScores[$recommended->code] ?? 0) : 0;
        $confidence = (int) min(98, max(40, round(($bestScore / $max) * 100)));

        $student->forceFill([
            'orientation_score' => $totalScore,
            'filiere_id' => $recommended?->getKey(),
        ])->save();

        return OrientationResult::query()->create([
            'orientation_test_id' => $test->getKey(),
            'student_id' => $student->getKey(),
            'answers' => $normalizedAnswers,
            'total_score' => $totalScore,
            'filiere_scores' => $this->formatScores($filieres, $filiereScores),
            'recommended_filiere_id' => $recommended?->getKey(),
            'confidence' => $confidence,
            'reasons' => $this->reasons($normalizedAnswers, $recommended),
            'taken_at' => now(),
        ]);
    }

    private function skillWeight(Filiere $filiere, string $skill): float
    {
        $skills = collect($filiere->recommended_skills ?? [])
            ->map(fn ($item) => strtolower((string) $item));

        return $skills->contains(strtolower($skill)) ? 1.25 : 0.45;
    }

    private function bestFiliere(Collection $filieres, array $scores, float $totalScore): ?Filiere
    {
        return $filieres
            ->filter(fn (Filiere $filiere) => $totalScore >= (float) ($filiere->minimum_orientation_score ?? 0))
            ->sortByDesc(fn (Filiere $filiere) => $scores[$filiere->code] ?? 0)
            ->first()
            ?? $filieres->sortByDesc(fn (Filiere $filiere) => $scores[$filiere->code] ?? 0)->first();
    }

    private function formatScores(Collection $filieres, array $scores): array
    {
        $maxScore = max(1, max($scores ?: [1]));

        return $filieres
            ->map(fn (Filiere $filiere) => [
                'id' => $filiere->id,
                'code' => $filiere->code,
                'name' => $filiere->name,
                'score' => round((($scores[$filiere->code] ?? 0) / $maxScore) * 100, 2),
            ])
            ->sortByDesc('score')
            ->values()
            ->all();
    }

    private function reasons(array $answers, ?Filiere $filiere): array
    {
        $topSkills = collect($answers)
            ->sortByDesc('value')
            ->take(3)
            ->pluck('skill_key')
            ->map(fn ($skill) => ucfirst(str_replace('_', ' ', $skill)))
            ->values()
            ->all();

        $reasons = array_map(fn ($skill) => "Affinite forte avec {$skill}", $topSkills);

        if ($filiere) {
            array_unshift($reasons, "Correspondance elevee avec {$filiere->name}");
        }

        return $reasons ?: ['Profil analyse avec les reponses du test.'];
    }
}
