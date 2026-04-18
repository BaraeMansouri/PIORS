<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Event extends BaseModel
{
    protected $fillable = [
        'title',
        'description',
        'image_path',
        'starts_at',
        'ends_at',
        'location',
        'capacity',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'capacity' => 'integer',
        ];
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class, 'event_id');
    }
}
