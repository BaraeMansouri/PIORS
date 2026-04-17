<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('internships', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('company');
            $table->text('description');
            $table->string('location')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->string('status')->default('open');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('internship_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('internship_id')->constrained('internships')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained('users')->cascadeOnDelete();
            $table->text('motivation');
            $table->string('status')->default('pending');
            $table->timestamp('applied_at')->nullable();
            $table->timestamps();
            $table->unique(['internship_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('internship_applications');
        Schema::dropIfExists('internships');
    }
};