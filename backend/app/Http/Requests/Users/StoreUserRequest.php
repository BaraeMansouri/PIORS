<?php

namespace App\Http\Requests\Users;

use App\Enums\UserRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreUserRequest extends FormRequest
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
            'password' => ['required', 'string', 'min:8'],
            'role' => ['required', Rule::in(UserRole::values())],
            'phone' => ['nullable', 'string', 'max:30'],
            'gender' => ['nullable', 'string', 'max:20'],
            'birth_date' => ['nullable', 'date'],
            'address' => ['nullable', 'string', 'max:255'],
            'class_id' => ['nullable', 'string'],
            'filiere_id' => ['nullable', 'string'],
            'skills' => ['nullable', 'array'],
            'skills.*' => ['string', 'max:80'],
        ];
    }
}
