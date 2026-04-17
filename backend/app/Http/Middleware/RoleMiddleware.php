<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return new JsonResponse([
                'message' => 'Unauthenticated.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        if ($roles !== [] && ! in_array($user->role, $roles, true)) {
            return new JsonResponse([
                'message' => 'Access denied for this role.',
            ], Response::HTTP_FORBIDDEN);
        }

        return $next($request);
    }
}
