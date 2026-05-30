<?php

namespace App\Http\Controllers\Api;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Absence;
use App\Models\Course;
use App\Models\Event;
use App\Models\Grade;
use App\Models\Internship;
use App\Models\OrientationResult;
use App\Models\PedagogicalRecommendation;
use App\Models\User;
use App\Services\RecommendationService;
use App\Services\RiskAssessmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;

class DashboardController extends Controller
{
    public function __construct(
        protected RiskAssessmentService $riskAssessmentService,
        protected RecommendationService $courseRecommendationService,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        return match ($user->role) {
            UserRole::Admin->value => response()->json($this->adminDashboard()),
            UserRole::Formateur->value => response()->json($this->trainerDashboard($user)),
            default => response()->json($this->studentDashboard($user)),
        };
    }

    private function studentDashboard(User $student): array
    {
        $student->load(['filiere', 'class']);
        $risk = $this->riskAssessmentService->evaluate($student);
        $result = OrientationResult::query()
            ->where('student_id', $student->getKey())
            ->with('recommendedFiliere')
            ->latest()
            ->first();
        $recommendations = PedagogicalRecommendation::query()
            ->where('student_id', $student->getKey())
            ->latest()
            ->limit(5)
            ->get();

        return [
            'stats' => [
                ['label' => 'Moyenne', 'value' => number_format((float) $student->average_grade, 2), 'trend' => $risk['at_risk'] ? 'Plan de soutien actif' : 'Progression stable', 'tone' => $risk['at_risk'] ? 'alert' : 'emerald'],
                ['label' => 'Absences', 'value' => (string) $student->absence_count, 'trend' => "Seuil {$risk['absence_threshold']}", 'tone' => $student->absence_count >= $risk['absence_threshold'] ? 'alert' : 'cyan'],
                ['label' => 'Orientation', 'value' => $student->orientation_score ? (string) round($student->orientation_score) : 'NA', 'trend' => $student->filiere?->name ?? 'Test a completer', 'tone' => 'neon'],
                ['label' => 'Conseils', 'value' => (string) $recommendations->where('status', 'open')->count(), 'trend' => 'Recommandations ouvertes', 'tone' => 'cyan'],
            ],
            'charts' => [
                'studentProgress' => $this->studentProgressChart($student),
                'trainerProgress' => $this->trainerProgressChart(),
                'adminPerformance' => $this->adminPerformanceChart(),
            ],
            'ai' => [
                'orientation' => [
                    'title' => $result?->recommendedFiliere?->name ?? $student->filiere?->name ?? 'Orientation a completer',
                    'confidence' => $result?->confidence ?? (int) ($student->orientation_score ?? 0),
                    'reasons' => $result?->reasons ?? ['Complete le test pour recevoir une orientation detaillee.'],
                ],
                'risk' => [
                    'summary' => $risk['at_risk'] ? 'Profil a accompagner en priorite.' : 'Profil stable selon les donnees actuelles.',
                    'actions' => $recommendations->pluck('title')->take(3)->values()->all() ?: ['Suivre les cours prioritaires', 'Planifier un point avec le formateur'],
                ],
            ],
            'notifications' => $this->notifications($student),
            'spotlightCourses' => $this->courseRecommendationService->forStudent($student),
            'spotlightEvents' => Event::query()->latest()->limit(4)->get(),
            'spotlightInternships' => Internship::query()->latest()->limit(4)->get(),
        ];
    }

    private function trainerDashboard(User $trainer): array
    {
        $students = User::query()->where('role', UserRole::Stagiaire->value)->with(['class', 'filiere'])->get();
        $atRisk = $students->filter(fn (User $student) => $this->riskAssessmentService->evaluate($student)['at_risk']);
        $recommendationsCount = PedagogicalRecommendation::query()->where('trainer_id', $trainer->getKey())->count();

        return [
            'stats' => [
                ['label' => 'Stagiaires', 'value' => (string) $students->count(), 'trend' => 'Suivi global disponible', 'tone' => 'cyan'],
                ['label' => 'Profils risque', 'value' => (string) $atRisk->count(), 'trend' => 'Moyenne basse ou absences', 'tone' => $atRisk->count() ? 'alert' : 'emerald'],
                ['label' => 'Notes saisies', 'value' => (string) Grade::query()->count(), 'trend' => 'Evaluations en base', 'tone' => 'neon'],
                ['label' => 'Conseils publies', 'value' => (string) $recommendationsCount, 'trend' => 'Recommandations formateur', 'tone' => 'emerald'],
            ],
            'charts' => [
                'trainerProgress' => $this->trainerProgressChart(),
                'studentProgress' => $this->studentProgressChart($students->first()),
                'adminPerformance' => $this->adminPerformanceChart(),
            ],
            'ai' => [
                'orientation' => $this->topOrientation(),
                'risk' => [
                    'summary' => $atRisk->count() ? "{$atRisk->count()} stagiaire(s) demandent un accompagnement." : 'Aucun risque critique detecte.',
                    'actions' => ['Saisir les notes recentes', 'Ajouter une recommandation ciblee', 'Verifier les absences de la semaine'],
                ],
            ],
            'notifications' => $this->notifications($trainer),
            'students' => $students->values(),
        ];
    }

    private function adminDashboard(): array
    {
        $students = User::query()->where('role', UserRole::Stagiaire->value)->get();
        $atRisk = $students->filter(fn (User $student) => $this->riskAssessmentService->evaluate($student)['at_risk']);
        $pending = User::query()->where('account_status', 'pending')->count();

        return [
            'stats' => [
                ['label' => 'Utilisateurs', 'value' => (string) User::query()->count(), 'trend' => "{$pending} compte(s) a valider", 'tone' => $pending ? 'alert' : 'cyan'],
                ['label' => 'Stagiaires', 'value' => (string) $students->count(), 'trend' => 'Profils suivis', 'tone' => 'emerald'],
                ['label' => 'Risque', 'value' => (string) $atRisk->count(), 'trend' => 'Alertes pedagogiques', 'tone' => $atRisk->count() ? 'alert' : 'emerald'],
                ['label' => 'Tests', 'value' => (string) OrientationResult::query()->count(), 'trend' => 'Resultats orientation', 'tone' => 'neon'],
            ],
            'charts' => [
                'adminPerformance' => $this->adminPerformanceChart(),
                'trainerProgress' => $this->trainerProgressChart(),
                'studentProgress' => $this->studentProgressChart($students->first()),
            ],
            'ai' => [
                'orientation' => $this->topOrientation(),
                'risk' => [
                    'summary' => $atRisk->count() ? "{$atRisk->count()} stagiaire(s) sous seuil de reussite." : 'La cohorte est stable.',
                    'actions' => ['Analyser les filieres sensibles', 'Valider les comptes en attente', 'Demander un plan de soutien aux formateurs'],
                ],
            ],
            'notifications' => [],
            'students' => $students->values(),
        ];
    }

    private function studentProgressChart(?User $student): array
    {
        $grades = $student
            ? Grade::query()->where('student_id', $student->getKey())->orderBy('graded_at')->orderBy('created_at')->get()
            : collect();

        return [
            'labels' => $grades->pluck('label')->values()->all() ?: ['Depart'],
            'datasets' => [[
                'label' => 'Notes',
                'data' => $grades->pluck('score')->map(fn ($score) => round((float) $score, 2))->values()->all() ?: [0],
                'borderColor' => '#39d0ff',
                'backgroundColor' => 'rgba(57, 208, 255, 0.15)',
                'tension' => 0.45,
                'fill' => true,
            ]],
        ];
    }

    private function trainerProgressChart(): array
    {
        $grades = Grade::query()->with('course')->get()->groupBy(fn (Grade $grade) => $grade->course?->title ?? 'Module');

        return [
            'labels' => $grades->keys()->values()->all() ?: ['Aucune note'],
            'datasets' => [[
                'label' => 'Moyenne module',
                'data' => $grades->map(fn (Collection $items) => round((float) $items->avg('score'), 2))->values()->all() ?: [0],
                'backgroundColor' => ['#39d0ff', '#7c3aed', '#10b981', '#f43f5e', '#f59e0b'],
                'borderRadius' => 12,
            ]],
        ];
    }

    private function adminPerformanceChart(): array
    {
        $students = User::query()->where('role', UserRole::Stagiaire->value)->get();
        $average = round((float) $students->avg('average_grade'), 2);
        $riskCount = $students->filter(fn (User $student) => $this->riskAssessmentService->evaluate($student)['at_risk'])->count();

        return [
            'labels' => ['Actuel', 'Objectif'],
            'datasets' => [
                [
                    'label' => 'Moyenne generale',
                    'data' => [$average, max($average, 14)],
                    'borderColor' => '#10b981',
                    'backgroundColor' => 'rgba(16, 185, 129, 0.14)',
                    'tension' => 0.4,
                    'fill' => true,
                ],
                [
                    'label' => 'Profils risque',
                    'data' => [$riskCount, 0],
                    'borderColor' => '#fb7185',
                    'backgroundColor' => 'rgba(251, 113, 133, 0.1)',
                    'tension' => 0.4,
                    'fill' => true,
                ],
            ],
        ];
    }

    private function topOrientation(): array
    {
        $result = OrientationResult::query()
            ->with('recommendedFiliere')
            ->latest()
            ->first();

        return [
            'title' => $result?->recommendedFiliere?->name ?? 'Orientation en collecte',
            'confidence' => $result?->confidence ?? 0,
            'reasons' => $result?->reasons ?? [],
        ];
    }

    private function notifications(User $user): array
    {
        return $user->notifications()
            ->latest()
            ->limit(8)
            ->get()
            ->map(fn ($notification) => [
                'id' => $notification->id,
                'title' => $notification->data['title'] ?? 'Notification',
                'message' => $notification->data['message'] ?? '',
                'created_at' => $notification->created_at,
                'read_at' => $notification->read_at,
            ])
            ->values()
            ->all();
    }
}
