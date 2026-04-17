<?php

namespace App\Http\Requests\Internships;

use Illuminate\Foundation\Http\FormRequest;

class StoreInternshipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:150'],
            'company' => ['required', 'string', 'max:150'],
            'description' => ['required', 'string'],
            'location' => ['nullable', 'string', 'max:150'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after_or_equal:starts_at'],
            'status' => ['nullable', 'string', 'max:50'],
        ];
    }
}
