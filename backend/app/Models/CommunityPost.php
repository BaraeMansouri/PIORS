<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CommunityPost extends BaseModel
{
    protected $fillable = [
        'author_id',
        'content',
        'tags',
        'likes',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'likes' => 'array',
        ];
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class, 'post_id');
    }
}