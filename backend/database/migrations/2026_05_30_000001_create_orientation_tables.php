<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orientation_tests', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('scoring_profile')->nullable();
            $table->timestamps();
        });

        Schema::create('orientation_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orientation_test_id')->constrained('orientation_tests')->cascadeOnDelete();
            $table->string('question');
            $table->string('skill_key')->default('logic');
            $table->json('options');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
        });

        Schema::create('orientation_results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orientation_test_id')->constrained('orientation_tests')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->json('answers');
            $table->decimal('total_score', 5, 2)->default(0);
            $table->json('filiere_scores')->nullable();
            $table->foreignId('recommended_filiere_id')->nullable()->constrained('filieres')->nullOnDelete();
            $table->unsignedInteger('confidence')->default(0);
            $table->json('reasons')->nullable();
            $table->timestamp('taken_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orientation_results');
        Schema::dropIfExists('orientation_questions');
        Schema::dropIfExists('orientation_tests');
    }
};
