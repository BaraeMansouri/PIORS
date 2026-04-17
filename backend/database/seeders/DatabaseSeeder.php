<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\AcademicClass;
use App\Models\Filiere;
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

        $class = AcademicClass::firstOrCreate([
            'code' => 'DD-2026-A',
        ], [
            'name' => 'DD 2026 Groupe A',
            'year' => '2025-2026',
            'capacity' => 30,
            'filiere_id' => $filiere->id,
            'description' => 'Classe principale de demonstration.',
        ]);

        User::firstOrCreate([
            'email' => 'admin@piors.test',
        ], [
            'name' => 'Admin PIORS',
            'password' => 'password',
            'role' => UserRole::Admin->value,
            'class_id' => $class->id,
            'filiere_id' => $filiere->id,
        ]);

        User::firstOrCreate([
            'email' => 'formateur@piors.test',
        ], [
            'name' => 'Formateur Demo',
            'password' => 'password',
            'role' => UserRole::Formateur->value,
            'class_id' => $class->id,
            'filiere_id' => $filiere->id,
        ]);

        User::firstOrCreate([
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
        ]);
    }
}