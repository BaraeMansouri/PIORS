import api from './api';

const fallbackCourseImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
const fallbackEventImage = 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80';
const fallbackInternshipImage = 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80';
const backendBase = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/api$/, '');

const normalizeId = (value) => String(value ?? '');
const assetUrl = (path) => (path ? `${backendBase || ''}/storage/${path}` : null);

const normalizeCourse = (course) => ({
  ...course,
  id: normalizeId(course.id),
  trainer_id: normalizeId(course.trainer_id),
  class_id: normalizeId(course.class_id),
  filiere_id: normalizeId(course.filiere_id),
  image: assetUrl(course.image_path) || course.image || fallbackCourseImage,
  level: course.level || 'Professionnel',
  support_priority: course.support_priority ?? 3,
  pdf_url: course.pdf_path ? `${backendBase}/storage/${course.pdf_path}` : '#',
});

const normalizeEvent = (event) => ({
  ...event,
  id: normalizeId(event.id),
  created_by: normalizeId(event.created_by),
  image: assetUrl(event.image_path) || fallbackEventImage,
  date: event.date || (event.starts_at ? new Date(event.starts_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : 'A planifier'),
  registered: event.registered ?? event.registrations_count ?? 0,
  is_registered: Boolean(event.is_registered),
  status: event.status || ((event.capacity && (event.registered ?? event.registrations_count ?? 0) >= event.capacity) ? 'Complet' : 'Ouvert'),
});

const normalizeInternship = (internship) => ({
  ...internship,
  id: normalizeId(internship.id),
  created_by: normalizeId(internship.created_by),
  image: assetUrl(internship.image_path) || fallbackInternshipImage,
  duration: internship.duration || (internship.starts_at && internship.ends_at ? 'Mission planifiee' : 'A definir'),
  status: internship.status || 'open',
  has_applied: Boolean(internship.has_applied),
  applications_count: internship.applications_count ?? 0,
});

export const academicService = {
  async getCourses() {
    const response = await api.get('/courses');
    return response.data.map(normalizeCourse);
  },

  async createCourse(payload) {
    const response = await api.post('/courses', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeCourse(response.data);
  },

  async updateCourse(id, payload) {
    const response = await api.post(`/courses/${id}?_method=PUT`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeCourse(response.data);
  },

  async deleteCourse(id) {
    await api.delete(`/courses/${id}`);
  },

  async getEvents() {
    const response = await api.get('/events');
    return response.data.map(normalizeEvent);
  },

  async createEvent(payload) {
    const response = await api.post('/events', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeEvent(response.data);
  },

  async updateEvent(id, payload) {
    const response = await api.post(`/events/${id}?_method=PUT`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeEvent(response.data);
  },

  async deleteEvent(id) {
    await api.delete(`/events/${id}`);
  },

  async registerEvent(id) {
    const response = await api.post(`/events/${id}/register`);
    return response.data;
  },

  async getInternships() {
    const response = await api.get('/internships');
    return response.data.map(normalizeInternship);
  },

  async createInternship(payload) {
    const response = await api.post('/internships', payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeInternship(response.data);
  },

  async updateInternship(id, payload) {
    const response = await api.post(`/internships/${id}?_method=PUT`, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeInternship(response.data);
  },

  async deleteInternship(id) {
    await api.delete(`/internships/${id}`);
  },

  async applyInternship(id, motivation) {
    const response = await api.post(`/internships/${id}/apply`, { motivation });
    return response.data;
  },
};
