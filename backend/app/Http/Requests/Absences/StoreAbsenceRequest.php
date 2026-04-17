<?php

namespace App\Http\Requests\Absences;

use Illuminate\Foundation\Http\FormRequest;

class StoreAbsenceRequest extends FormRequest
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
            'date' => ['required', 'date'],
            'status' => ['required', 'string', 'max:30'],
            'reason' => ['nullable', 'string'],
        ];
    }
}
