<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Grade extends BaseModel
{
    protected $fillable = [
        'student_id',
        'course_id',
        'trainer_id',
        'label',
        'score',
        'coefficient',
        'graded_at',
    ];

    protected function casts(): array
    {
        return [
            'score' => 'float',
            'coefficient' => 'float',
            'graded_at' => 'datetime',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function course(): BelongsTo
    {
        return $this->belongsTo(Course::class, 'course_id');
    }
}