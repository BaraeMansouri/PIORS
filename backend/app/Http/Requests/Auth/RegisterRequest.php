<?php

namespace App\Http\Requests\Auth;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            'email' => ['required', 'email', 'max:150'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['nullable', Rule::in(UserRole::values())],
            'phone' => ['nullable', 'string', 'max:30'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', 'max:80'],
        ];
    }
}
