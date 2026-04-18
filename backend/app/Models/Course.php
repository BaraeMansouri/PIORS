<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Course extends BaseModel
{
    protected $fillable = [
        'title',
        'description',
        'image_path',
        'pdf_path',
        'class_id',
        'filiere_id',
        'trainer_id',
        'support_priority',
    ];

    protected function casts(): array
    {
        return [
            'support_priority' => 'integer',
        ];
    }

    public function class(): BelongsTo
    {
        return $this->belongsTo(AcademicClass::class, 'class_id');
    }

    public function filiere(): BelongsTo
    {
        return $this->belongsTo(Filiere::class, 'filiere_id');
    }

    public function trainer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'trainer_id');
    }
}
