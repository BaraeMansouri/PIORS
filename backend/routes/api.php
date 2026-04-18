<?php

use App\Http\Controllers\Api\AbsenceController;
use App\Http\Controllers\Api\AcademicClassController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\CommunityPostController;
use App\Http\Controllers\Api\CourseController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\FiliereController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\InternshipController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\StudentInsightController;
use App\Http\Controllers\Api\UserController;
use App\Enums\UserRole;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function (): void {
        Route::get('me', [AuthController::class, 'me']);
        Route::patch('profile', [AuthController::class, 'updateProfile']);
        Route::post('logout', [AuthController::class, 'logout']);
    });
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('notifications', [NotificationController::class, 'index']);
    Route::post('notifications/{id}/read', [NotificationController::class, 'markAsRead']);

    Route::get('students/{student}/insights', [StudentInsightController::class, 'show'])
        ->middleware('role:'.UserRole::Admin->value.','.UserRole::Formateur->value);

    Route::apiResource('courses', CourseController::class);
    Route::apiResource('events', EventController::class);
    Route::post('events/{event}/register', [EventController::class, 'register']);

    Route::apiResource('internships', InternshipController::class);
    Route::post('internships/{internship}/apply', [InternshipController::class, 'apply']);

    Route::apiResource('posts', CommunityPostController::class);
    Route::post('posts/{post}/comments', [CommentController::class, 'store']);
    Route::delete('comments/{comment}', [CommentController::class, 'destroy']);
    Route::post('posts/{post}/likes', [CommunityPostController::class, 'toggleLike']);

    Route::middleware('role:'.UserRole::Admin->value.','.UserRole::Formateur->value)->group(function (): void {
        Route::apiResource('grades', GradeController::class);
        Route::apiResource('absences', AbsenceController::class);
    });

    Route::middleware('role:'.UserRole::Admin->value)->group(function (): void {
        Route::apiResource('students', UserController::class)->parameters(['students' => 'user']);
        Route::get('formateurs', [UserController::class, 'trainers']);
        Route::post('formateurs', [UserController::class, 'storeTrainer']);
        Route::put('formateurs/{user}', [UserController::class, 'updateTrainer']);
        Route::delete('formateurs/{user}', [UserController::class, 'destroy']);
        Route::post('users/{user}/approve', [UserController::class, 'approve']);
        Route::post('users/{user}/reset-password', [UserController::class, 'resetPassword']);

        Route::apiResource('classes', AcademicClassController::class);
        Route::apiResource('filieres', FiliereController::class);
        Route::post('classes/{academicClass}/assign-students', [AcademicClassController::class, 'assignStudents']);
        Route::post('students/{user}/orientation', [StudentInsightController::class, 'orient']);
    });
});
