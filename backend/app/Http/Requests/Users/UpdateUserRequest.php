<?php

namespace App\Http\Requests\Users;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:120'],
            'email' => ['sometimes', 'email', 'max:150'],
            'password' => ['sometimes', 'string', 'min:8'],
            'role' => ['sometimes', Rule::in(UserRole::values())],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'gender' => ['sometimes', 'nullable', 'string', 'max:20'],
            'birth_date' => ['sometimes', 'nullable', 'date'],
            'address' => ['sometimes', 'nullable', 'string', 'max:255'],
            'class_id' => ['sometimes', 'nullable', 'string'],
            'filiere_id' => ['sometimes', 'nullable', 'string'],
            'skills' => ['sometimes', 'nullable', 'array'],
            'skills.*' => ['string', 'max:80'],
        ];
    }
}
