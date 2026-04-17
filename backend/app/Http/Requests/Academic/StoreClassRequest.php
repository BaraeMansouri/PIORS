<?php

namespace App\Http\Requests\Academic;

use Illuminate\Foundation\Http\FormRequest;

class StoreClassRequest extends FormRequest
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
            'year' => ['required', 'string', 'max:30'],
            'capacity' => ['required', 'integer', 'min:1'],
            'filiere_id' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
        ];
    }
}
