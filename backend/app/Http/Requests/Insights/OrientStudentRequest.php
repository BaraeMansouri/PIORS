<?php

namespace App\Http\Requests\Insights;

use Illuminate\Foundation\Http\FormRequest;

class OrientStudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'score' => ['required', 'numeric', 'min:0', 'max:100'],
        ];
    }
}
