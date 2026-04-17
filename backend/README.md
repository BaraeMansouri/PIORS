# PIORS Backend

Backend Laravel API de la plateforme **PIORS**.

## Stack retenue

- Laravel 12
- Sanctum
- SQLite par defaut pour demarrer vite
- Compatible MySQL si besoin plus tard

## Structure

- `app/Http/Controllers/Api` : endpoints REST
- `app/Http/Requests` : validations
- `app/Models` : modeles Eloquent
- `app/Services` : orientation, risque, recommandations, moyenne
- `routes/api.php` : routes API
- `database/migrations` : schema SQL complet
- `database/seeders` : donnees de demo

## Modules disponibles

- Auth: register, login, logout, me
- Utilisateurs: CRUD stagiaires, CRUD formateurs, reset password
- Academique: classes, filieres, affectation
- Cours: upload PDF, assignation classe/filiere
- Events: CRUD + inscription
- Stages: CRUD + candidature
- Notes et absences: CRUD + calcul moyenne
- Community: posts, commentaires, likes
- Notifications: stockees en base
- IA simple: orientation, risque, recommandations

## Installation

```bash
composer install
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

## Base de donnees

Le projet est configure par defaut avec SQLite.

Fichier utilise:

- `database/database.sqlite`

Si tu veux MySQL plus tard, il suffit de modifier `.env`.

## Comptes seedes

- Admin: `admin@piors.test` / `password`
- Formateur: `formateur@piors.test` / `password`
- Stagiaire: `stagiaire@piors.test` / `password`

## Lancer le backend

```bash
cd backend
php artisan serve
```

API disponible sur:

- `http://127.0.0.1:8000`

## Verification rapide effectuee

- `composer install` reussi
- `php artisan migrate:fresh --seed` reussi
- `php artisan route:list --path=api` reussi
- serveur Laravel demarre correctement
- PHPUnit: `OK (2 tests, 2 assertions)`