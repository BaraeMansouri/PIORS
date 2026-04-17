<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Academic\StoreFiliereRequest;
use App\Models\Filiere;
use Illuminate\Http\JsonResponse;

class FiliereController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(Filiere::query()->latest()->get());
    }

    public function store(StoreFiliereRequest $request): JsonResponse
    {
        $filiere = Filiere::query()->create($request->validated());

        return response()->json($filiere, 201);
    }

    public function show(Filiere $filiere): JsonResponse
    {
        return response()->json($filiere->load('classes'));
    }

    public function update(StoreFiliereRequest $request, Filiere $filiere): JsonResponse
    {
        $filiere->update($request->validated());

        return response()->json($filiere->fresh());
    }

    public function destroy(Filiere $filiere): JsonResponse
    {
        $filiere->delete();

        return response()->json(status: 204);
    }
}
