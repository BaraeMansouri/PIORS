<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Community\StoreCommentRequest;
use App\Models\Comment;
use App\Models\CommunityPost;
use Illuminate\Http\JsonResponse;

class CommentController extends Controller
{
    public function store(StoreCommentRequest $request, CommunityPost $post): JsonResponse
    {
        $comment = Comment::query()->create([
            'post_id' => $post->getKey(),
            'author_id' => $request->user()->getKey(),
            'content' => $request->validated('content'),
        ]);

        return response()->json($comment, 201);
    }

    public function destroy(Comment $comment): JsonResponse
    {
        if (request()->user()->getKey() !== $comment->author_id && ! request()->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $comment->delete();

        return response()->json(status: 204);
    }
}
