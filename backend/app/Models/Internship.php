<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Internship extends BaseModel
{
    protected $fillable = [
        'title',
        'company',
        'description',
        'location',
        'starts_at',
        'ends_at',
        'status',
        'created_by',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
        ];
    }

    public function applications(): HasMany
    {
        return $this->hasMany(InternshipApplication::class, 'internship_id');
    }
}