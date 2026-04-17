<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Absence extends BaseModel
{
    protected $fillable = [
        'student_id',
        'course_id',
        'recorded_by',
        'date',
        'status',
        'reason',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
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