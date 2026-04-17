<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AcademicClass extends BaseModel
{
    protected $table = 'academic_classes';

    protected $fillable = [
        'name',
        'code',
        'year',
        'capacity',
        'filiere_id',
        'description',
    ];

    protected function casts(): array
    {
        return [
            'capacity' => 'integer',
        ];
    }

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class, 'filiere_id');
    }

    public function students(): HasMany
    {
        return $this->hasMany(User::class, 'class_id');
    }
}