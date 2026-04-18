import { useEffect, useState } from 'react';
import { FiHeart, FiMapPin, FiMessageCircle, FiPlus, FiSend, FiTrash2, FiUser } from 'react-icons/fi';
import SectionHeader from '../../components/SectionHeader';
import GlassCard from '../../components/GlassCard';
import PrimaryButton from '../../components/PrimaryButton';
import { communityService } from '../../services/communityService';
import { useAuth } from '../../context/AuthContext';
import AnimatedModal from '../../components/AnimatedModal';

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [commentDrafts, setCommentDrafts] = useState({});
  const { user } = useAuth();

  const flash = (setter, text) => {
    setter(text);
    window.setTimeout(() => setter(''), 2400);
  };

  const load = async () => {
    try {
      setPosts(await communityService.getPosts());
    } catch (loadError) {
      setError(loadError.response?.data?.message || 'Impossible de charger la community.');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const canDeletePost = (post) => user?.role === 'admin' || String(post.author.id) === String(user?.id);
  const canDeleteComment = (comment) => user?.role === 'admin' || String(comment.author.id) === String(user?.id);

  const submitPost = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const created = await communityService.createPost({
        content: postContent,
        tags: postTags.split(',').map((tag) => tag.trim()).filter(Boolean),
      });

      setPosts((prev) => [created, ...prev]);
      setPostContent('');
      setPostTags('');
      setOpen(false);
      flash(setMessage, 'Post publie avec succes.');
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Publication impossible.');
    }
  };

  const toggleLike = async (postId) => {
    try {
      setError('');
      const updated = await communityService.toggleLike(postId);
      setPosts((prev) => prev.map((post) => (post.id === updated.id ? updated : post)));
    } catch (likeError) {
      setError(likeError.response?.data?.message || 'Action like impossible.');
    }
  };

  const addComment = async (event, postId) => {
    event.preventDefault();
    const content = commentDrafts[postId];
    if (!content?.trim()) return;

    try {
      setError('');
      const created = await communityService.addComment(postId, { content });
      setPosts((prev) => prev.map((post) => (post.id === String(postId)
        ? { ...post, comments: [...post.comments, created] }
        : post)));
      setCommentDrafts((prev) => ({ ...prev, [postId]: '' }));
      flash(setMessage, 'Commentaire ajoute.');
    } catch (commentError) {
      setError(commentError.response?.data?.message || 'Ajout du commentaire impossible.');
    }
  };

  const deletePost = async (postId) => {
    try {
      setError('');
      await communityService.deletePost(postId);
      setPosts((prev) => prev.filter((post) => post.id !== String(postId)));
      flash(setMessage, 'Post supprime.');
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Suppression du post impossible.');
    }
  };

  const deleteComment = async (commentId, postId) => {
    try {
      setError('');
      await communityService.deleteComment(commentId);
      setPosts((prev) => prev.map((post) => (post.id === String(postId)
        ? { ...post, comments: post.comments.filter((comment) => comment.id !== String(commentId)) }
        : post)));
      flash(setMessage, 'Commentaire supprime.');
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Suppression du commentaire impossible.');
    }
  };

  return (
    <div className="space-y-8">
      <SectionHeader eyebrow="Phase 5 - Community" title="Feed social securise" subtitle="Profils publics limites a: nom, prenom, image, classe et filiere. Aucune note ni absence n est exposee." actions={<PrimaryButton onClick={() => setOpen(true)}><FiPlus /> Nouveau post</PrimaryButton>} />
      {message ? <div className="rounded-2xl border border-emerald/20 bg-emerald/10 px-4 py-3 text-sm font-semibold text-emerald">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-alert/20 bg-alert/10 px-4 py-3 text-sm font-semibold text-alert">{error}</div> : null}
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          {posts.map((post) => (
            <GlassCard key={post.id} className="p-5">
              <div className="flex items-start gap-4">
                <button type="button" onClick={() => setSelectedProfile(post.author)}>
                  <img src={post.author.image} alt={post.author.name} className="h-14 w-14 rounded-2xl object-cover" />
                </button>
                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <button type="button" className="text-left" onClick={() => setSelectedProfile(post.author)}>
                      <h3 className="font-semibold text-white">{post.author.firstName} {post.author.lastName}</h3>
                      <p className="text-sm text-slate-400">{post.author.className} • {post.author.filiere}</p>
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-500">{post.time}</span>
                      {canDeletePost(post) ? (
                        <button type="button" className="text-slate-400 transition hover:text-rose-300" onClick={() => deletePost(post.id)}>
                          <FiTrash2 />
                        </button>
                      ) : null}
                    </div>
                  </div>
                  <p className="mt-4 leading-7 text-slate-300">{post.content}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags?.map((tag) => <span key={tag} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-cyan">#{tag}</span>)}
                  </div>
                  <div className="mt-5 flex items-center gap-6 text-sm text-slate-300">
                    <button type="button" className={`inline-flex items-center gap-2 ${post.likedByMe ? 'text-rose-300' : 'text-slate-300'}`} onClick={() => toggleLike(post.id)}>
                      <FiHeart className={post.likedByMe ? 'fill-current text-rose-400' : 'text-slate-400'} /> {post.likes} likes
                    </button>
                    <span className="inline-flex items-center gap-2"><FiMessageCircle className="text-cyan" /> {post.comments.length} commentaires</span>
                  </div>
                  <div className="mt-5 space-y-3 rounded-[22px] border border-white/10 bg-white/[0.03] p-4">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex items-start justify-between gap-4">
                        <div>
                          <button type="button" className="font-medium text-white" onClick={() => setSelectedProfile(comment.author)}>{comment.author.name}</button>
                          <p className="text-sm text-slate-400">{comment.content}</p>
                        </div>
                        {canDeleteComment(comment) ? (
                          <button type="button" className="text-slate-400 transition hover:text-rose-300" onClick={() => deleteComment(comment.id, post.id)}>
                            <FiTrash2 />
                          </button>
                        ) : null}
                      </div>
                    ))}
                    <form className="flex gap-3 pt-2" onSubmit={(event) => addComment(event, post.id)}>
                      <input
                        value={commentDrafts[post.id] ?? ''}
                        onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [post.id]: event.target.value }))}
                        placeholder="Ajouter un commentaire..."
                        className="ui-input flex-1 rounded-2xl px-4 py-3"
                      />
                      <PrimaryButton type="submit"><FiSend /></PrimaryButton>
                    </form>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
        <GlassCard className="h-fit p-5">
          <p className="text-xs uppercase tracking-[0.35em] text-cyan/80">Charte privacy</p>
          <h3 className="mt-4 font-display text-2xl font-semibold text-white">Community by design</h3>
          <ul className="mt-5 space-y-3 text-sm text-slate-300">
            <li>Visible: nom, prenom, image, classe, filiere.</li>
            <li>Cache: notes, absences, statistiques privees.</li>
            <li>Moderation admin disponible depuis le dashboard.</li>
          </ul>
        </GlassCard>
      </div>
      <AnimatedModal open={open} title="Publier un post" onClose={() => setOpen(false)}>
        <form className="space-y-4" onSubmit={submitPost}>
          <label className="block">
            <span className="ui-title mb-2 block text-sm font-medium">Contenu</span>
            <textarea value={postContent} onChange={(event) => setPostContent(event.target.value)} rows="5" className="ui-input rounded-2xl px-4 py-3" required />
          </label>
          <label className="block">
            <span className="ui-title mb-2 block text-sm font-medium">Tags</span>
            <input value={postTags} onChange={(event) => setPostTags(event.target.value)} placeholder="react, laravel, stage" className="ui-input rounded-2xl px-4 py-3" />
          </label>
          <PrimaryButton type="submit" className="w-full">Publier</PrimaryButton>
        </form>
      </AnimatedModal>
      <AnimatedModal open={Boolean(selectedProfile)} title="Profil public" onClose={() => setSelectedProfile(null)}>
        {selectedProfile ? (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <img src={selectedProfile.image} alt={selectedProfile.name} className="h-20 w-20 rounded-[24px] object-cover" />
              <div>
                <h3 className="ui-title font-display text-2xl font-semibold">{selectedProfile.name}</h3>
                <p className="ui-muted text-sm">{selectedProfile.className} • {selectedProfile.filiere}</p>
              </div>
            </div>
            <div className="grid gap-3">
              <div className="ui-soft rounded-2xl p-4">
                <p className="ui-muted text-xs uppercase tracking-[0.28em]">Classe</p>
                <p className="mt-2 text-white">{selectedProfile.className}</p>
              </div>
              <div className="ui-soft rounded-2xl p-4">
                <p className="ui-muted text-xs uppercase tracking-[0.28em]">Filiere</p>
                <p className="mt-2 text-white">{selectedProfile.filiere}</p>
              </div>
              <div className="ui-soft rounded-2xl p-4">
                <p className="ui-muted text-xs uppercase tracking-[0.28em]">Email</p>
                <p className="mt-2 text-white">{selectedProfile.email}</p>
              </div>
              <div className="ui-soft rounded-2xl p-4">
                <p className="ui-muted text-xs uppercase tracking-[0.28em]">Confidentialite</p>
                <p className="mt-2 flex items-center gap-2 text-white"><FiUser /> Profil public securise</p>
                <p className="mt-2 flex items-center gap-2 text-slate-300"><FiMapPin /> Notes et absences non visibles</p>
              </div>
            </div>
          </div>
        ) : null}
      </AnimatedModal>
    </div>
  );
}
