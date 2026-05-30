<?php

namespace App\Http\Requests\Orientation;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrientationQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'question' => ['required', 'string', 'max:240'],
            'skill_key' => ['required', 'string', 'max:80'],
            'options' => ['nullable', 'array'],
            'options.*.label' => ['required_with:options', 'string', 'max:80'],
            'options.*.value' => ['required_with:options', 'numeric', 'min:0', 'max:30'],
            'position' => ['nullable', 'integer', 'min:0'],
        ];
    }
}
