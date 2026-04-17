<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventRegistration extends BaseModel
{
    protected $fillable = [
        'event_id',
        'student_id',
        'registered_at',
    ];

    protected function casts(): array
    {
        return [
            'registered_at' => 'datetime',
        ];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class, 'event_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }
}