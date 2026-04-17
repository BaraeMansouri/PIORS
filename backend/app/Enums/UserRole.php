<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Formateur = 'formateur';
    case Stagiaire = 'stagiaire';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
