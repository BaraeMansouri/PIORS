<?php

namespace App\Http\Requests\Courses;

use Illuminate\Foundation\Http\FormRequest;

class StoreCourseRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'image' => ['nullable', 'image', 'max:5120'],
            'pdf' => ['nullable', 'file', 'mimes:pdf', 'max:10240'],
            'class_id' => ['nullable', 'string'],
            'filiere_id' => ['nullable', 'string'],
            'trainer_id' => ['nullable', 'string'],
            'support_priority' => ['nullable', 'integer', 'min:0', 'max:5'],
        ];
    }
}
