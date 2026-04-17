<?php

namespace App\Http\Requests\Grades;

use Illuminate\Foundation\Http\FormRequest;

class StoreGradeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_id' => ['required', 'string'],
            'course_id' => ['required', 'string'],
            'label' => ['required', 'string', 'max:120'],
            'score' => ['required', 'numeric', 'min:0', 'max:20'],
            'coefficient' => ['nullable', 'numeric', 'min:0.5', 'max:10'],
            'graded_at' => ['nullable', 'date'],
        ];
    }
}
