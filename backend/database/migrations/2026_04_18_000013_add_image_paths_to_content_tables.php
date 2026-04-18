<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('courses', function (Blueprint $table): void {
            $table->string('image_path')->nullable()->after('description');
        });

        Schema::table('events', function (Blueprint $table): void {
            $table->string('image_path')->nullable()->after('description');
        });

        Schema::table('internships', function (Blueprint $table): void {
            $table->string('image_path')->nullable()->after('company');
        });
    }

    public function down(): void
    {
        Schema::table('internships', function (Blueprint $table): void {
            $table->dropColumn('image_path');
        });

        Schema::table('events', function (Blueprint $table): void {
            $table->dropColumn('image_path');
        });

        Schema::table('courses', function (Blueprint $table): void {
            $table->dropColumn('image_path');
        });
    }
};
