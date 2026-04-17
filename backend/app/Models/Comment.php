<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comment extends BaseModel
{
    protected $fillable = [
        'post_id',
        'author_id',
        'content',
    ];

    public function post(): BelongsTo
    {
        return $this->belongsTo(CommunityPost::class, 'post_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}