<?php

namespace App\Http\Requests\Orientation;

use Illuminate\Foundation\Http\FormRequest;

class SubmitOrientationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id' => ['nullable', 'integer', 'exists:users,id'],
            'answers' => ['required', 'array', 'min:1'],
            'answers.*.question_id' => ['required', 'integer', 'exists:orientation_questions,id'],
            'answers.*.value' => ['required', 'numeric', 'min:0', 'max:30'],
            'answers.*.label' => ['nullable', 'string', 'max:120'],
        ];
    }
}
