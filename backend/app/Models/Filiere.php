<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Filiere extends BaseModel
{
    protected $fillable = [
        'name',
        'code',
        'description',
        'minimum_orientation_score',
        'recommended_skills',
    ];

    protected function casts(): array
    {
        return [
            'minimum_orientation_score' => 'float',
            'recommended_skills' => 'array',
        ];
    }

    public function classes(): HasMany
    {
        return $this->hasMany(AcademicClass::class, 'filiere_id');
    }
}