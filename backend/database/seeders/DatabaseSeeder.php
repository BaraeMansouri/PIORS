<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\Absence;
use App\Models\AcademicClass;
use App\Models\Course;
use App\Models\Event;
use App\Models\Filiere;
use App\Models\Grade;
use App\Models\Internship;
use App\Models\OrientationTest;
use App\Models\PedagogicalRecommendation;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $filiere = Filiere::firstOrCreate([
            'code' => 'DEV101',
        ], [
            'name' => 'Developpement Digital',
            'description' => 'Filiere recommandee pour les profils techniques.',
            'minimum_orientation_score' => 70,
            'recommended_skills' => ['php', 'javascript', 'sql'],
        ]);

        $uxFiliere = Filiere::firstOrCreate([
            'code' => 'UIX102',
        ], [
            'name' => 'UI / Communication Digitale',
            'description' => 'Filiere adaptee aux profils creatifs, produit et communication.',
            'minimum_orientation_score' => 55,
            'recommended_skills' => ['design', 'communication', 'creativity'],
        ]);

        $dataFiliere = Filiere::firstOrCreate([
            'code' => 'DATA103',
        ], [
            'name' => 'Data & Business Intelligence',
            'description' => 'Filiere recommandee pour les profils analyse, logique et statistiques.',
            'minimum_orientation_score' => 65,
            'recommended_skills' => ['data', 'logic', 'sql'],
        ]);

        $class = AcademicClass::firstOrCreate([
            'code' => 'DD-2026-A',
        ], [
            'name' => 'DD 2026 Groupe A',
            'year' => '2025-2026',
            'capacity' => 30,
            'filiere_id' => $filiere->id,
            'description' => 'Classe principale de demonstration.',
        ]);

        $admin = User::firstOrCreate([
            'email' => 'admin@piors.test',
        ], [
            'name' => 'Admin PIORS',
            'password' => 'password',
            'role' => UserRole::Admin->value,
            'class_id' => $class->id,
            'filiere_id' => $filiere->id,
            'city' => 'Casablanca',
            'bio' => 'Responsable de la supervision et du pilotage global de la plateforme.',
        ]);

        $trainer = User::firstOrCreate([
            'email' => 'formateur@piors.test',
        ], [
            'name' => 'Formateur Demo',
            'password' => 'password',
            'role' => UserRole::Formateur->value,
            'class_id' => $class->id,
            'filiere_id' => $filiere->id,
            'city' => 'Rabat',
            'bio' => 'Formateur referent sur les parcours web et data.',
        ]);

        $student = User::firstOrCreate([
            'email' => 'stagiaire@piors.test',
        ], [
            'name' => 'Stagiaire Demo',
            'password' => 'password',
            'role' => UserRole::Stagiaire->value,
            'class_id' => $class->id,
            'filiere_id' => $filiere->id,
            'orientation_score' => 78,
            'average_grade' => 12.5,
            'absence_count' => 2,
            'skills' => ['html', 'css', 'php'],
            'city' => 'Marrakech',
            'bio' => 'Stagiaire motive avec un profil oriente frontend et experience utilisateur.',
        ]);

        $course = Course::firstOrCreate([
            'title' => 'Architecture Laravel API',
        ], [
            'description' => 'Endpoints REST, validation, Sanctum et bonnes pratiques API.',
            'class_id' => $class->id,
            'filiere_id' => $filiere->id,
            'trainer_id' => $trainer->id,
            'support_priority' => 4,
        ]);

        $uiCourse = Course::firstOrCreate([
            'title' => 'React Experience Design',
        ], [
            'description' => 'Interfaces React, design system, accessibilite et experience utilisateur.',
            'class_id' => $class->id,
            'filiere_id' => $uxFiliere->id,
            'trainer_id' => $trainer->id,
            'support_priority' => 3,
        ]);

        Grade::firstOrCreate([
            'student_id' => $student->id,
            'course_id' => $course->id,
            'label' => 'Evaluation API',
        ], [
            'trainer_id' => $trainer->id,
            'score' => 12.5,
            'coefficient' => 2,
            'graded_at' => now()->subDays(12),
        ]);

        Grade::firstOrCreate([
            'student_id' => $student->id,
            'course_id' => $uiCourse->id,
            'label' => 'Prototype UX',
        ], [
            'trainer_id' => $trainer->id,
            'score' => 15,
            'coefficient' => 1,
            'graded_at' => now()->subDays(4),
        ]);

        Absence::firstOrCreate([
            'student_id' => $student->id,
            'course_id' => $course->id,
            'date' => now()->subDays(9)->toDateString(),
        ], [
            'recorded_by' => $trainer->id,
            'status' => 'justified',
            'reason' => 'Rendez-vous administratif.',
        ]);

        Event::firstOrCreate([
            'title' => 'Workshop Orientation IA',
        ], [
            'description' => 'Atelier pour comprendre les resultats des tests et choisir un parcours.',
            'starts_at' => now()->addDays(8),
            'ends_at' => now()->addDays(8)->addHours(2),
            'location' => 'OFPPT Casablanca',
            'capacity' => 60,
            'created_by' => $admin->id,
        ]);

        Internship::firstOrCreate([
            'title' => 'Frontend Engineer Intern',
            'company' => 'PIORS Lab',
        ], [
            'description' => 'Stage de consolidation React, API Laravel et dashboard analytics.',
            'location' => 'Casablanca',
            'starts_at' => now()->addMonth(),
            'ends_at' => now()->addMonths(3),
            'status' => 'open',
            'created_by' => $admin->id,
        ]);

        $test = OrientationTest::firstOrCreate([
            'title' => 'Test orientation PIORS',
        ], [
            'description' => 'Questionnaire principal pour proposer une filiere adaptee au profil du stagiaire.',
            'is_active' => true,
        ]);

        collect([
            ['question' => 'Tu preferes resoudre des problemes logiques ?', 'skill_key' => 'logic', 'position' => 1],
            ['question' => 'Tu aimes prototyper des interfaces modernes ?', 'skill_key' => 'design', 'position' => 2],
            ['question' => 'Tu es a l aise avec les donnees et les tableaux ?', 'skill_key' => 'data', 'position' => 3],
            ['question' => 'Tu aimes expliquer une idee et convaincre un public ?', 'skill_key' => 'communication', 'position' => 4],
            ['question' => 'Tu preferes coder et automatiser des solutions ?', 'skill_key' => 'javascript', 'position' => 5],
        ])->each(function (array $question) use ($test): void {
            $test->questions()->updateOrCreate([
                'question' => $question['question'],
            ], [
                'skill_key' => $question['skill_key'],
                'position' => $question['position'],
                'options' => [
                    ['label' => 'Peu', 'value' => 10],
                    ['label' => 'Moyennement', 'value' => 20],
                    ['label' => 'Beaucoup', 'value' => 30],
                ],
            ]);
        });

        PedagogicalRecommendation::firstOrCreate([
            'student_id' => $student->id,
            'title' => 'Renforcer les bases API',
        ], [
            'trainer_id' => $trainer->id,
            'message' => 'Revoir les validations Laravel et refaire un mini CRUD avec Sanctum.',
            'priority' => 'medium',
            'status' => 'open',
            'context' => ['source' => 'seed', 'module' => 'Laravel'],
            'due_at' => now()->addDays(7),
        ]);

        $student->forceFill([
            'average_grade' => 13.33,
            'absence_count' => 1,
        ])->save();
    }
}
