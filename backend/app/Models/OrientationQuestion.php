<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrientationQuestion extends BaseModel
{
    protected $fillable = [
        'orientation_test_id',
        'question',
        'skill_key',
        'options',
        'position',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'position' => 'integer',
        ];
    }

    public function test(): BelongsTo
    {
        return $this->belongsTo(OrientationTest::class, 'orientation_test_id');
    }
}
