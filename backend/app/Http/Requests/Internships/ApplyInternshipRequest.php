<?php

namespace App\Http\Requests\Internships;

use Illuminate\Foundation\Http\FormRequest;

class ApplyInternshipRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'motivation' => ['required', 'string', 'min:10'],
        ];
    }
}
