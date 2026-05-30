<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class OrientationTest extends BaseModel
{
    protected $fillable = [
        'title',
        'description',
        'is_active',
        'scoring_profile',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'scoring_profile' => 'array',
        ];
    }

    public function questions(): HasMany
    {
        return $this->hasMany(OrientationQuestion::class)->orderBy('position');
    }

    public function results(): HasMany
    {
        return $this->hasMany(OrientationResult::class);
    }
}
