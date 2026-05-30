<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrientationResult extends BaseModel
{
    protected $fillable = [
        'orientation_test_id',
        'student_id',
        'answers',
        'total_score',
        'filiere_scores',
        'recommended_filiere_id',
        'confidence',
        'reasons',
        'taken_at',
    ];

    protected function casts(): array
    {
        return [
            'answers' => 'array',
            'total_score' => 'float',
            'filiere_scores' => 'array',
            'confidence' => 'integer',
            'reasons' => 'array',
            'taken_at' => 'datetime',
        ];
    }

    public function test(): BelongsTo
    {
        return $this->belongsTo(OrientationTest::class, 'orientation_test_id');
    }

    public function student(): BelongsTo
    {
        return $this->belongsTo(User::class, 'student_id');
    }

    public function recommendedFiliere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class, 'recommended_filiere_id');
    }
}
