import api from './api';

const backendBase = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/api$/, '');

const resolveAvatar = (avatar, name) => {
  if (!avatar) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name ?? 'PIORS')}&background=0f172a&color=ffffff`;
  }

  if (avatar.startsWith('http') || avatar.startsWith('data:')) {
    return avatar;
  }

  return `${backendBase}/storage/${avatar}`;
};

const splitName = (name = '') => {
  const [firstName, ...rest] = name.split(' ');
  return {
    firstName: firstName || name,
    lastName: rest.join(' '),
  };
};

const normalizeComment = (comment) => {
  const author = comment.author ?? {};
  const names = splitName(author.name);

  return {
    ...comment,
    id: String(comment.id),
    author: {
      id: String(author.id ?? ''),
      name: author.name ?? 'Utilisateur',
      firstName: author.firstName ?? names.firstName,
      lastName: author.lastName ?? names.lastName,
      image: resolveAvatar(author.avatar, author.name),
      email: author.email ?? 'Non public',
      className: author.className ?? author.class?.name ?? 'Classe non renseignee',
      filiere: typeof author.filiere === 'string' ? author.filiere : author.filiere?.name ?? 'Filiere non renseignee',
    },
    content: comment.content,
  };
};

const normalizePost = (post) => {
  const author = post.author ?? {};
  const names = splitName(author.name);
  const likeIds = Array.isArray(post.likes) ? post.likes.map((item) => String(item)) : [];
  const likes = likeIds.length || Number(post.likes ?? 0);

  return {
    ...post,
    id: String(post.id),
    time: post.created_at ? new Date(post.created_at).toLocaleString('fr-FR') : "A l'instant",
    likes,
    likedByMe: likeIds.length ? likeIds.includes(String(post.current_user_id ?? '')) : Boolean(post.likedByMe),
    author: {
      id: String(author.id ?? ''),
      name: author.name ?? 'Utilisateur',
      firstName: author.firstName ?? names.firstName,
      lastName: author.lastName ?? names.lastName,
      image: resolveAvatar(author.avatar, author.name),
      email: author.email ?? 'Non public',
      className: author.className ?? author.class?.name ?? 'Classe non renseignee',
      filiere: typeof author.filiere === 'string' ? author.filiere : author.filiere?.name ?? 'Filiere non renseignee',
    },
    comments: (post.comments ?? []).map(normalizeComment),
  };
};

export const communityService = {
  async getPosts() {
    const response = await api.get('/posts');
    return response.data.map((post) => normalizePost({ ...post, current_user_id: String(JSON.parse(localStorage.getItem('piors_user') || '{}').id ?? '') }));
  },

  async createPost(payload) {
    const response = await api.post('/posts', payload);
    return normalizePost(response.data);
  },

  async updatePost(id, payload) {
    const response = await api.put(`/posts/${id}`, payload);
    return normalizePost(response.data);
  },

  async deletePost(id) {
    await api.delete(`/posts/${id}`);
  },

  async toggleLike(id) {
    const response = await api.post(`/posts/${id}/likes`);
    return normalizePost(response.data);
  },

  async addComment(postId, payload) {
    const response = await api.post(`/posts/${postId}/comments`, payload);
    return normalizeComment(response.data);
  },

  async deleteComment(id) {
    await api.delete(`/comments/${id}`);
  },
};
