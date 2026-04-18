<?php

namespace App\Models;

use App\Enums\UserRole;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'account_status',
        'approved_at',
        'phone',
        'gender',
        'birth_date',
        'address',
        'city',
        'bio',
        'avatar',
        'class_id',
        'filiere_id',
        'orientation_score',
        'average_grade',
        'absence_count',
        'skills',
        'profile_completed_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'birth_date' => 'date',
            'approved_at' => 'datetime',
            'profile_completed_at' => 'datetime',
            'skills' => 'array',
            'orientation_score' => 'float',
            'average_grade' => 'float',
            'absence_count' => 'integer',
            'password' => 'hashed',
        ];
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(AcademicClass::class, 'class_id');
    }

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class, 'filiere_id');
    }

    public function grades(): HasMany
    {
        return $this->hasMany(Grade::class, 'student_id');
    }

    public function absences(): HasMany
    {
        return $this->hasMany(Absence::class, 'student_id');
    }

    public function posts(): HasMany
    {
        return $this->hasMany(CommunityPost::class, 'author_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'author_id');
    }

    public function internships(): HasMany
    {
        return $this->hasMany(InternshipApplication::class, 'student_id');
    }

    public function events(): HasMany
    {
        return $this->hasMany(EventRegistration::class, 'student_id');
    }

    public function isAdmin(): bool
    {
        return $this->role === UserRole::Admin->value;
    }

    public function isTrainer(): bool
    {
        return $this->role === UserRole::Formateur->value;
    }

    public function isStudent(): bool
    {
        return $this->role === UserRole::Stagiaire->value;
    }

    public function isApproved(): bool
    {
        return $this->account_status === 'approved';
    }
}
