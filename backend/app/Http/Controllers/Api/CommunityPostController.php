<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Community\StorePostRequest;
use App\Models\CommunityPost;
use Illuminate\Http\JsonResponse;

class CommunityPostController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(CommunityPost::query()->with(['author', 'comments'])->latest()->get());
    }

    public function store(StorePostRequest $request): JsonResponse
    {
        $post = CommunityPost::query()->create([
            'author_id' => $request->user()->getKey(),
            'content' => $request->validated('content'),
            'tags' => $request->validated('tags', []),
            'likes' => [],
        ]);

        return response()->json($post, 201);
    }

    public function show(CommunityPost $post): JsonResponse
    {
        return response()->json($post->load(['author', 'comments.author']));
    }

    public function update(StorePostRequest $request, CommunityPost $post): JsonResponse
    {
        if ($request->user()->getKey() !== $post->author_id && ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $post->update($request->validated());

        return response()->json($post->fresh());
    }

    public function destroy(CommunityPost $post): JsonResponse
    {
        if (request()->user()->getKey() !== $post->author_id && ! request()->user()->isAdmin()) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        $post->delete();

        return response()->json(status: 204);
    }

    public function toggleLike(CommunityPost $post): JsonResponse
    {
        $likes = collect($post->likes ?? []);
        $userId = request()->user()->getKey();

        $post->likes = $likes->contains($userId)
            ? $likes->reject(fn (string $id) => $id === $userId)->values()->all()
            : $likes->push($userId)->unique()->values()->all();

        $post->save();

        return response()->json($post->fresh());
    }
}
