<?php

namespace Tests\Feature;

use App\Enums\UserRole;
use App\Models\CommunityPost;
use App\Models\Course;
use App\Models\Event;
use App\Models\Internship;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_update_profile(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Stagiaire->value,
            'city' => 'Fes',
        ]);

        Sanctum::actingAs($user);

        $response = $this->patchJson('/api/auth/profile', [
            'name' => 'Aya Demo',
            'city' => 'Casablanca',
            'bio' => 'Profil mis a jour',
        ]);

        $response->assertOk()
            ->assertJsonFragment([
                'name' => 'Aya Demo',
                'city' => 'Casablanca',
                'bio' => 'Profil mis a jour',
            ]);

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Aya Demo',
            'city' => 'Casablanca',
        ]);
    }

    public function test_authenticated_user_can_upload_profile_avatar(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'role' => UserRole::Stagiaire->value,
        ]);

        Sanctum::actingAs($user);

        $avatarFile = new UploadedFile(
            base_path('../OFPPT_Logo.png'),
            'avatar.png',
            'image/png',
            null,
            true
        );

        $response = $this->patch('/api/auth/profile', [
            'name' => 'Aya Demo',
            'avatar' => $avatarFile,
        ], [
            'Accept' => 'application/json',
        ]);

        $response->assertOk();
        $avatarPath = $response->json('avatar');

        $this->assertNotNull($avatarPath);
        $this->assertStringContainsString('/storage/avatars/', $avatarPath);

        $user->refresh();
        Storage::disk('public')->assertExists($user->avatar);
    }

    public function test_registered_student_requires_admin_approval_before_login(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin->value,
            'account_status' => 'approved',
            'approved_at' => now(),
        ]);

        $registerResponse = $this->postJson('/api/auth/register', [
            'name' => 'Nouveau Stagiaire',
            'email' => 'nouveau@piors.test',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => UserRole::Stagiaire->value,
        ]);

        $registerResponse->assertCreated()
            ->assertJsonFragment([
                'message' => 'Compte cree. En attente de validation par un administrateur.',
            ]);

        $createdUser = User::query()->where('email', 'nouveau@piors.test')->firstOrFail();
        $this->assertSame('pending', $createdUser->account_status);
        $this->assertNotNull($admin->fresh()->notifications()->first());

        $this->postJson('/api/auth/login', [
            'email' => 'nouveau@piors.test',
            'password' => 'password123',
        ])->assertForbidden();

        Sanctum::actingAs($admin);
        $this->postJson("/api/users/{$createdUser->id}/approve")
            ->assertOk()
            ->assertJsonFragment(['message' => 'Compte valide avec succes.']);

        $this->postJson('/api/auth/login', [
            'email' => 'nouveau@piors.test',
            'password' => 'password123',
        ])->assertOk();
    }

    public function test_authenticated_user_can_create_course_event_and_internship(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Admin->value,
        ]);

        Sanctum::actingAs($user);

        $courseResponse = $this->postJson('/api/courses', [
            'title' => 'Laravel Expert',
            'description' => 'Cours backend pour soutenance.',
            'support_priority' => 4,
        ]);

        $eventResponse = $this->postJson('/api/events', [
            'title' => 'Demo Day PIORS',
            'description' => 'Presentation finale du projet.',
            'starts_at' => now()->addDay()->toISOString(),
            'ends_at' => now()->addDays(2)->toISOString(),
            'location' => 'Campus OFPPT',
            'capacity' => 50,
        ]);

        $internshipResponse = $this->postJson('/api/internships', [
            'title' => 'Frontend Internship',
            'company' => 'OFPPT Lab',
            'description' => 'Mission frontend React.',
            'location' => 'Casablanca',
            'status' => 'open',
        ]);

        $courseResponse->assertCreated()->assertJsonFragment(['title' => 'Laravel Expert']);
        $eventResponse->assertCreated()->assertJsonFragment(['title' => 'Demo Day PIORS']);
        $internshipResponse->assertCreated()->assertJsonFragment(['title' => 'Frontend Internship']);

        $this->assertDatabaseHas('courses', ['title' => 'Laravel Expert']);
        $this->assertDatabaseHas('events', ['title' => 'Demo Day PIORS']);
        $this->assertDatabaseHas('internships', ['title' => 'Frontend Internship']);
    }

    public function test_admin_can_update_and_delete_created_content(): void
    {
        $admin = User::factory()->create([
            'role' => UserRole::Admin->value,
        ]);

        Sanctum::actingAs($admin);

        $course = Course::query()->create([
            'title' => 'Cours initial',
            'description' => 'Description',
            'trainer_id' => $admin->id,
        ]);

        $event = Event::query()->create([
            'title' => 'Event initial',
            'description' => 'Description',
            'starts_at' => now()->addDay(),
            'ends_at' => now()->addDays(2),
            'location' => 'Campus',
            'capacity' => 20,
            'created_by' => $admin->id,
        ]);

        $internship = Internship::query()->create([
            'title' => 'Stage initial',
            'company' => 'OFPPT',
            'description' => 'Mission',
            'created_by' => $admin->id,
        ]);

        $this->putJson("/api/courses/{$course->id}", [
            'title' => 'Cours mis a jour',
            'description' => 'Description mise a jour',
        ])->assertOk()->assertJsonFragment(['title' => 'Cours mis a jour']);

        $this->putJson("/api/events/{$event->id}", [
            'title' => 'Event mis a jour',
            'description' => 'Description mise a jour',
            'starts_at' => now()->addDays(3)->toISOString(),
            'ends_at' => now()->addDays(4)->toISOString(),
            'location' => 'Salle B',
            'capacity' => 42,
        ])->assertOk()->assertJsonFragment(['title' => 'Event mis a jour']);

        $this->putJson("/api/internships/{$internship->id}", [
            'title' => 'Stage mis a jour',
            'company' => 'OFPPT Labs',
            'description' => 'Mission detaillee',
            'status' => 'open',
        ])->assertOk()->assertJsonFragment(['title' => 'Stage mis a jour']);

        $this->deleteJson("/api/courses/{$course->id}")->assertNoContent();
        $this->deleteJson("/api/events/{$event->id}")->assertNoContent();
        $this->deleteJson("/api/internships/{$internship->id}")->assertNoContent();
    }

    public function test_user_can_like_and_comment_a_post(): void
    {
        $user = User::factory()->create([
            'role' => UserRole::Stagiaire->value,
        ]);

        $author = User::factory()->create([
            'role' => UserRole::Formateur->value,
        ]);

        $post = CommunityPost::query()->create([
            'author_id' => $author->id,
            'content' => 'Publication community',
            'tags' => ['react'],
            'likes' => [],
        ]);

        Sanctum::actingAs($user);

        $this->postJson("/api/posts/{$post->id}/likes")
            ->assertOk()
            ->assertJsonPath('likes.0', $user->id);

        $this->postJson("/api/posts/{$post->id}/comments", [
            'content' => 'Tres bon partage',
        ])->assertCreated()->assertJsonFragment([
            'content' => 'Tres bon partage',
        ]);
    }
}
