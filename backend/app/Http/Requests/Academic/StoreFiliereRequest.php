<?php

namespace App\Http\Requests\Academic;

use Illuminate\Foundation\Http\FormRequest;

class StoreFiliereRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'code' => ['required', 'string', 'max:50'],
            'description' => ['nullable', 'string'],
            'minimum_orientation_score' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'recommended_skills' => ['nullable', 'array'],
            'recommended_skills.*' => ['string', 'max:80'],
        ];
    }
}
