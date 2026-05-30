<?php

namespace App\Http\Requests\Orientation;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrientationTestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
            'scoring_profile' => ['nullable', 'array'],
        ];
    }
}
