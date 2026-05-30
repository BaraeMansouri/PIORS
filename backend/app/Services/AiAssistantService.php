<?php

namespace App\Services;

use App\Models\PedagogicalRecommendation;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Throwable;

class AiAssistantService
{
    public function chat(User $user, string $message, array $history = []): array
    {
        $context = $this->studentContext($user);
        $prompt = $this->basePrompt($context);

        if ($this->hasOpenAiKey()) {
            try {
                return [
                    'provider' => 'openai',
                    'answer' => $this->askOpenAi($prompt, $message, $history),
                ];
            } catch (Throwable) {
                // Keep the assistant available for demos even when the API key/network is missing.
            }
        }

        return [
            'provider' => 'local',
            'answer' => $this->localChatAnswer($message, $context),
        ];
    }

    public function recommendationFor(User $student): array
    {
        $student->loadMissing(['class', 'filiere']);
        $context = $this->studentContext($student);
        $message = "Genere une recommandation pedagogique concrete pour {$student->name}.";

        if ($this->hasOpenAiKey()) {
            try {
                $answer = $this->askOpenAi($this->basePrompt($context), $message, []);

                return [
                    'provider' => 'openai',
                    'title' => 'Plan de soutien IA',
                    'message' => $answer,
                    'priority' => $this->priorityFor($student),
                    'risk_summary' => $this->riskSummary($student),
                ];
            } catch (Throwable) {
                // Fallback below.
            }
        }

        return [
            'provider' => 'local',
            'title' => $this->priorityFor($student) === 'high' ? 'Plan de rattrapage prioritaire' : 'Plan de progression personnalise',
            'message' => $this->localRecommendation($student),
            'priority' => $this->priorityFor($student),
            'risk_summary' => $this->riskSummary($student),
        ];
    }

    private function askOpenAi(string $instructions, string $message, array $history): string
    {
        $messages = [
            ['role' => 'developer', 'content' => $instructions],
        ];

        foreach (array_slice($history, -8) as $item) {
            $role = ($item['type'] ?? '') === 'user' ? 'user' : 'assistant';
            $content = trim((string) ($item['text'] ?? ''));
            if ($content !== '') {
                $messages[] = ['role' => $role, 'content' => $content];
            }
        }

        $messages[] = ['role' => 'user', 'content' => $message];

        $response = Http::timeout(25)
            ->withToken((string) config('services.openai.key'))
            ->acceptJson()
            ->post('https://api.openai.com/v1/chat/completions', [
                'model' => config('services.openai.model', 'gpt-4o-mini'),
                'messages' => $messages,
                'temperature' => 0.35,
                'max_tokens' => 420,
            ])
            ->throw()
            ->json();

        return trim((string) data_get($response, 'choices.0.message.content', ''));
    }

    private function basePrompt(array $context): string
    {
        return implode("\n", [
            'Tu es PIORS AI, assistant pedagogique pour OFPPT.',
            'Reponds en francais simple avec un ton encourageant.',
            'Donne des actions concretes, courtes et utiles.',
            'Ne donne pas de diagnostic medical ou juridique.',
            'Contexte stagiaire JSON:',
            json_encode($context, JSON_UNESCAPED_UNICODE),
        ]);
    }

    private function studentContext(User $user): array
    {
        $user->loadMissing(['class', 'filiere']);

        $recommendations = PedagogicalRecommendation::query()
            ->where('student_id', $user->getKey())
            ->latest()
            ->limit(3)
            ->get(['title', 'priority', 'status']);

        return [
            'name' => $user->name,
            'role' => $user->role,
            'class' => $user->class?->name,
            'filiere' => $user->filiere?->name,
            'orientation_score' => $user->orientation_score,
            'average_grade' => $user->average_grade,
            'absence_count' => $user->absence_count,
            'skills' => $user->skills,
            'recent_recommendations' => $recommendations,
        ];
    }

    private function localChatAnswer(string $message, array $context): string
    {
        $text = $this->normalizeText($message);
        $profile = implode("\n", $this->profileLines($context));

        if ($this->containsAny($text, ['orientation', 'filiere', 'branche', 'metier', 'choisir', 'parcours'])) {
            return implode("\n\n", [
                'Analyse orientation:',
                $profile,
                'Ce que je te conseille:',
                '- ' . $this->orientationAdvice($context),
                '- Compare ta filiere avec 3 competences que tu aimes vraiment utiliser.',
                '- Si le resultat ne te semble pas logique, refais le test apres avoir relu les questions calmement.',
                'Prochaine action:',
                '1. Complete le test orientation si ce n est pas encore fait.',
                '2. Note tes 3 competences fortes et un exemple concret pour chacune.',
                '3. Demande au formateur de valider si la filiere correspond bien a ton profil.',
            ]);
        }

        if ($this->containsAny($text, ['absence', 'absences', 'retard', 'presence', 'present'])) {
            return implode("\n\n", [
                'Suivi des absences:',
                $profile,
                'Lecture de la situation:',
                '- ' . $this->absenceAdvice($context),
                '- Chaque absence non rattrapee peut creer un trou dans les exercices et les evaluations.',
                'Plan de rattrapage:',
                '1. Justifie les absences qui peuvent l etre.',
                '2. Recupere les supports des seances manquees avant le prochain cours.',
                '3. Demande au formateur une courte liste des exercices prioritaires.',
            ]);
        }

        if ($this->containsAny($text, ['note', 'notes', 'moyenne', 'ameliorer', 'ameliore', 'evaluation', 'examen', 'controle'])) {
            return implode("\n\n", [
                'Analyse des notes:',
                $profile,
                'Diagnostic:',
                '- ' . $this->gradeAdvice($context),
                '- Travaille d abord le module ou tu perds le plus de points, pas celui qui te parait le plus facile.',
                'Plan court:',
                '1. Refaire un exercice corrige aujourd hui.',
                '2. Lister 3 erreurs repetees dans tes anciennes evaluations.',
                '3. Demander une correction rapide au formateur avant la prochaine note.',
            ]);
        }

        if ($this->containsAny($text, ['stage', 'cv', 'portfolio', 'entretien', 'societe', 'entreprise'])) {
            return implode("\n\n", [
                'Preparation stage:',
                $profile,
                'Ce qu il faut preparer:',
                '- Un CV simple avec ta filiere, tes competences et 2 projets ou exercices concrets.',
                '- Un mini portfolio: captures, liens GitHub ou description claire des travaux realises.',
                '- Une motivation adaptee a chaque entreprise, pas le meme message pour tout le monde.',
                'Plan d action:',
                '1. Choisir 5 entreprises liees a ta filiere.',
                '2. Adapter ton CV avec les mots cles de chaque offre.',
                '3. Preparer une reponse courte: ce que tu sais faire, ce que tu veux apprendre, et pourquoi cette entreprise.',
            ]);
        }

        return implode("\n\n", [
            'Analyse rapide:',
            $profile,
            'Ce que je comprends:',
            '- ' . $this->gradeAdvice($context),
            '- ' . $this->absenceAdvice($context),
            '- ' . $this->orientationAdvice($context),
            'Plan d action pour cette semaine:',
            '1. Choisir un module prioritaire et refaire un exercice corrige.',
            '2. Garder 30 minutes par jour pour reviser les notions qui bloquent.',
            '3. Envoyer une question precise au formateur avec l exercice ou la partie non comprise.',
            'Priorite:',
            '- ' . $this->priorityAdvice($context),
        ]);
    }

    private function localRecommendation(User $student): string
    {
        $average = (float) ($student->average_grade ?? 0);
        $absences = (int) ($student->absence_count ?? 0);
        $actions = [];

        if ($average < 10) {
            $actions[] = 'Programmer deux seances de rattrapage cette semaine sur les modules ou les notes sont sous 10.';
            $actions[] = 'Donner un exercice court corrige, puis refaire une correction individuelle.';
        } elseif ($average < 12) {
            $actions[] = 'Consolider les bases avec deux exercices appliques avant la prochaine evaluation.';
            $actions[] = 'Verifier les erreurs repetees dans les anciennes copies.';
        } else {
            $actions[] = 'Maintenir le rythme avec un exercice applique par semaine et un suivi de progression.';
            $actions[] = 'Proposer un mini projet pour transformer les acquis en pratique.';
        }

        if ($absences >= 8) {
            $actions[] = 'Faire un point presence avec le stagiaire et recuperer les supports des seances manquees.';
        } elseif ($absences >= 4) {
            $actions[] = 'Verifier les supports manques pour eviter que les absences creent un retard durable.';
        }

        $actions[] = 'Fixer un objectif mesurable pour la prochaine evaluation.';

        return implode("\n\n", [
            'Situation actuelle:',
            '- Moyenne: ' . $this->formatAverage($student->average_grade ?? null),
            '- Absences: ' . $absences,
            '- Filiere: ' . ($student->filiere?->name ?? 'non renseignee'),
            'Actions recommandees:',
            $this->numberedLines($actions),
            'Suivi:',
            '- Revoir la progression dans 7 jours avec une note, une presence et un retour formateur.',
        ]);
    }

    private function profileLines(array $context): array
    {
        $lines = [
            '- Stagiaire: ' . ($context['name'] ?? 'non renseigne'),
            '- Filiere: ' . (($context['filiere'] ?? null) ?: 'non renseignee'),
            '- Classe: ' . (($context['class'] ?? null) ?: 'non renseignee'),
            '- Moyenne actuelle: ' . $this->formatAverage($context['average_grade'] ?? null),
            '- Absences: ' . (int) ($context['absence_count'] ?? 0),
            '- Score orientation: ' . $this->formatScore($context['orientation_score'] ?? null),
        ];

        $recommendation = $this->latestRecommendation($context);
        if ($recommendation !== null) {
            $lines[] = '- Derniere recommandation: ' . $recommendation;
        }

        return $lines;
    }

    private function gradeAdvice(array $context): string
    {
        $average = $this->toFloatOrNull($context['average_grade'] ?? null);

        if ($average === null) {
            return 'Aucune moyenne claire n est encore disponible, donc il faut d abord saisir ou verifier les notes.';
        }

        if ($average < 10) {
            return 'La moyenne est sous 10, donc la priorite est un rattrapage rapide avec exercices corriges.';
        }

        if ($average < 12) {
            return 'La moyenne est juste stable, il faut renforcer les bases avant que les prochaines evaluations baissent le resultat.';
        }

        if ($average < 14) {
            return 'La moyenne est correcte, le meilleur gain vient d exercices reguliers et d une correction des erreurs repetees.';
        }

        return 'La moyenne est bonne, tu peux viser l excellence avec un mini projet ou des exercices plus avances.';
    }

    private function absenceAdvice(array $context): string
    {
        $absences = (int) ($context['absence_count'] ?? 0);

        if ($absences >= 8) {
            return "Tu as {$absences} absences, c est un signal de risque eleve: il faut justifier, recuperer les supports et faire un point avec le formateur.";
        }

        if ($absences >= 4) {
            return "Tu as {$absences} absences, ce n est pas encore critique mais il faut rattraper les seances manquees.";
        }

        if ($absences > 0) {
            return "Tu as {$absences} absence(s), la situation reste gerable si tu recuperes vite les supports.";
        }

        return 'Aucune absence importante n apparait, garde ce rythme de presence.';
    }

    private function orientationAdvice(array $context): string
    {
        $score = $this->toFloatOrNull($context['orientation_score'] ?? null);
        $filiere = ($context['filiere'] ?? null) ?: 'ta filiere actuelle';

        if ($score === null) {
            return 'Le test orientation n est pas encore exploitable, complete-le pour confirmer la filiere la plus adaptee.';
        }

        if ($score >= 70) {
            return "Ton score orientation est fort pour {$filiere}; consolide les competences principales de cette filiere.";
        }

        if ($score >= 55) {
            return "Ton score orientation est moyen pour {$filiere}; compare aussi les filieres proches avant de confirmer ton choix.";
        }

        return "Ton score orientation est faible pour {$filiere}; il vaut mieux refaire le test et discuter le choix avec le formateur.";
    }

    private function priorityAdvice(array $context): string
    {
        $average = $this->toFloatOrNull($context['average_grade'] ?? null);
        $absences = (int) ($context['absence_count'] ?? 0);

        if (($average !== null && $average < 10) || $absences >= 8) {
            return 'Priorite haute: rattrapage pedagogique et suivi presence cette semaine.';
        }

        if (($average !== null && $average < 12) || $absences >= 4) {
            return 'Priorite moyenne: consolider les bases et suivre les absences avant la prochaine evaluation.';
        }

        return 'Priorite normale: garder la regularite et transformer les acquis en projet concret.';
    }

    private function latestRecommendation(array $context): ?string
    {
        $recommendations = $context['recent_recommendations'] ?? [];

        foreach ($recommendations as $recommendation) {
            $title = is_array($recommendation) ? ($recommendation['title'] ?? null) : ($recommendation->title ?? null);
            $priority = is_array($recommendation) ? ($recommendation['priority'] ?? null) : ($recommendation->priority ?? null);

            if ($title) {
                return $priority ? "{$title} ({$priority})" : $title;
            }
        }

        return null;
    }

    private function containsAny(string $text, array $needles): bool
    {
        foreach ($needles as $needle) {
            if (str_contains($text, $needle)) {
                return true;
            }
        }

        return false;
    }

    private function normalizeText(string $text): string
    {
        $normalized = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);

        return strtolower($normalized === false ? $text : $normalized);
    }

    private function formatAverage(mixed $value): string
    {
        $number = $this->toFloatOrNull($value);

        return $number === null ? 'non renseignee' : $this->formatNumber($number) . '/20';
    }

    private function formatScore(mixed $value): string
    {
        $number = $this->toFloatOrNull($value);

        return $number === null ? 'non renseigne' : $this->formatNumber($number) . '/100';
    }

    private function formatNumber(float $number): string
    {
        return rtrim(rtrim(number_format($number, 2, '.', ''), '0'), '.');
    }

    private function toFloatOrNull(mixed $value): ?float
    {
        if ($value === null || $value === '') {
            return null;
        }

        return is_numeric($value) ? (float) $value : null;
    }

    private function numberedLines(array $lines): string
    {
        return implode("\n", array_map(
            fn (string $line, int $index): string => ($index + 1) . '. ' . $line,
            array_values($lines),
            array_keys(array_values($lines)),
        ));
    }

    private function priorityFor(User $student): string
    {
        return ((float) ($student->average_grade ?? 0) < 10 || (int) ($student->absence_count ?? 0) >= 8) ? 'high' : 'medium';
    }

    private function riskSummary(User $student): string
    {
        return $this->priorityFor($student) === 'high'
            ? 'Risque pedagogique eleve: accompagnement recommande.'
            : 'Profil stable: suivi regulier recommande.';
    }

    private function hasOpenAiKey(): bool
    {
        return filled(config('services.openai.key'));
    }
}
