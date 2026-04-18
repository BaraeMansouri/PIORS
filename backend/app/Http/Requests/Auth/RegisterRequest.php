<?php

namespace App\Http\Requests\Auth;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
            'role' => ['nullable', Rule::in(UserRole::values())],
            'phone' => ['nullable', 'string', 'max:30'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', 'max:80'],
        ];
    }

    public function messages(): array
    {
        return [
            'email.unique' => 'Cet email est deja utilise. Choisissez une autre adresse ou connectez-vous.',
            'password.confirmed' => 'La confirmation du mot de passe ne correspond pas.',
            'password.min' => 'Le mot de passe doit contenir au moins 8 caracteres.',
        ];
    }
}
