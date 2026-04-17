<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InternshipApplication extends BaseModel
{
    protected $fillable = [
        'internship_id',
        'student_id',
        'motivation',
        'status',
        'applied_at',
    ];

    protected function casts(): array
    {
        return [
            'applied_at' => 'datetime',
        ];
    }

    public function internship(): BelongsTo
    {
        return $this->belongsTo(Internship::class, 'internship_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}