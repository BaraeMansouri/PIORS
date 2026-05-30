<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PedagogicalRecommendation extends BaseModel
{
    protected $fillable = [
        'student_id',
        'trainer_id',
        'title',
        'message',
        'priority',
        'status',
        'context',
        'due_at',
    ];

    protected function casts(): array
    {
        return [
            'context' => 'array',
            'due_at' => 'date',
        ];
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }
}
