import { useEffect, useState } from 'react';
import { Calendar, Edit2, Heart, ImagePlus, MessageCircle, Send, Trash2, X } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { getUploadUrl } from '../utils/media';

const emptyBlogForm = { title: '', body: '', tags: '', image: '' };

function buildExcerpt(body = '', maxLength = 150) {
  const text = String(body).replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

function tagList(tags = '') {
  return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
}

export default function CommunityBlogSection() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const canCreateBlog = user?.role === 'petOwner' || isAdmin;
  const [blogs, setBlogs] = useState([]);
  const [userBlogs, setUserBlogs] = useState([]);
  const [activeTab, setActiveTab] = useState('browse');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [form, setForm] = useState(emptyBlogForm);
  const [editingBlogId, setEditingBlogId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState(emptyBlogForm);

  useEffect(() => {
    loadBlogs();
  }, [user?.id]);

  function flashMessage(message, isError = false) {
    if (isError) {
      setError(message);
      window.setTimeout(() => setError(''), 3000);
      return;
    }
    setSuccess(message);
    window.setTimeout(() => setSuccess(''), 3000);
  }

  async function loadBlogs() {
    setLoading(true);
    try {
      const { data } = await api.get('/blogs');
      const items = data.items || [];
      setBlogs(items.filter((blog) => blog.status === 'published'));

      if (user?.id) {
        setUserBlogs(items.filter((blog) => String(blog.author?._id || blog.author?.id || blog.author) === String(user.id)));
      } else {
        setUserBlogs([]);
      }
    } catch (loadError) {
      flashMessage(loadError.response?.data?.message || 'Failed to load blogs', true);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBlog(event) {
    event.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      flashMessage('Title and body are required', true);
      return;
    }

    setLoading(true);
    try {
      await api.post('/blogs', {
        title: form.title,
        body: form.body,
        tags: tagList(form.tags),
        image: form.image,
        status: 'published'
      });
      setForm(emptyBlogForm);
      setActiveTab('myblogs');
      flashMessage('Blog published successfully!');
      await loadBlogs();
    } catch (createError) {
      flashMessage(createError.response?.data?.message || 'Failed to publish blog', true);
    } finally {
      setLoading(false);
    }
  }

  async function handleEditBlog(event) {
    event.preventDefault();
    if (!editForm.title.trim() || !editForm.body.trim()) {
      flashMessage('Title and body are required', true);
      return;
    }

    setLoading(true);
    try {
      await api.put(`/blogs/${editingBlogId}`, {
        title: editForm.title,
        body: editForm.body,
        tags: tagList(editForm.tags),
        image: editForm.image
      });
      setShowEditModal(false);
      setEditingBlogId(null);
      setEditForm(emptyBlogForm);
      flashMessage('Blog updated successfully!');
      await loadBlogs();
    } catch (editError) {
      flashMessage(editError.response?.data?.message || 'Failed to update blog', true);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteBlog(blogId) {
    if (!window.confirm('Delete this blog post?')) return;

    setLoading(true);
    try {
      await api.delete(`/blogs/${blogId}`);
      flashMessage('Blog deleted successfully!');
      await loadBlogs();
    } catch (deleteError) {
      flashMessage(deleteError.response?.data?.message || 'Failed to delete blog', true);
    } finally {
      setLoading(false);
    }
  }

  function openEditModal(blog) {
    setEditingBlogId(blog._id);
    setEditForm({
      title: blog.title,
      body: blog.body,
      tags: (blog.tags || []).join(', '),
      image: blog.image || ''
    });
    setShowEditModal(true);
  }

  async function uploadBlogImage(event, target = 'create') {
    const file = event.target.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append('file', file);
    setUploadingImage(true);
    setError('');

    try {
      const response = await api.post('/uploads', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const path = response.data.file?.path || response.data.file?.filename;
      if (path) {
        const setter = target === 'edit' ? setEditForm : setForm;
        setter((current) => ({ ...current, image: path }));
      }
    } catch (uploadError) {
      flashMessage(uploadError.response?.data?.message || 'Photo upload failed', true);
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  }

  function renderPhotoField(currentForm, setCurrentForm, target) {
    return (
      <label className="blog-dashboard-field">
        <span>Blog photo</span>
        <div className="blog-dashboard-upload-row">
          <label className={`ghost-button compact blog-dashboard-upload ${uploadingImage ? 'disabled' : ''}`}>
            <ImagePlus size={16} /> {uploadingImage ? 'Uploading...' : currentForm.image ? 'Change photo' : 'Add photo'}
            <input
              type="file"
              accept="image/*"
              disabled={uploadingImage}
              onChange={(uploadEvent) => uploadBlogImage(uploadEvent, target)}
            />
          </label>
          {currentForm.image && (
            <button type="button" className="ghost-button compact" onClick={() => setCurrentForm((current) => ({ ...current, image: '' }))}>
              Remove photo
            </button>
          )}
        </div>
        {currentForm.image && <img className="blog-dashboard-preview" src={getUploadUrl(currentForm.image)} alt="Blog preview" />}
      </label>
    );
  }

  function renderBlogForm(currentForm, setCurrentForm, onSubmit, submitLabel, imageTarget) {
    return (
      <form className="blog-dashboard-form" onSubmit={onSubmit}>
        <label className="blog-dashboard-field">
          <span>Blog title</span>
          <input
            type="text"
            placeholder="Enter blog title"
            value={currentForm.title}
            onChange={(event) => setCurrentForm({ ...currentForm, title: event.target.value })}
            required
          />
        </label>
        <label className="blog-dashboard-field">
          <span>Tags</span>
          <input
            type="text"
            placeholder="grooming, nutrition, health"
            value={currentForm.tags}
            onChange={(event) => setCurrentForm({ ...currentForm, tags: event.target.value })}
          />
        </label>
        {renderPhotoField(currentForm, setCurrentForm, imageTarget)}
        <label className="blog-dashboard-field">
          <span>Blog content</span>
          <textarea
            placeholder="Write your blog post content..."
            value={currentForm.body}
            onChange={(event) => setCurrentForm({ ...currentForm, body: event.target.value })}
            required
            rows={8}
          />
        </label>
        <button type="submit" className="primary-button blog-dashboard-submit" disabled={loading}>
          <Send size={16} /> {loading ? 'Saving...' : submitLabel}
        </button>
      </form>
    );
  }

  function renderBlogCard(blog) {
    const isOwner = String(blog.author?._id || blog.author?.id || blog.author) === String(user?.id);

    return (
      <article key={blog._id} className="blog-dashboard-card">
        <div className="blog-dashboard-image-wrap">
          <img src={getUploadUrl(blog.image)} alt={blog.title} className="blog-dashboard-image" />
          <span className={`adoption-status-badge ${blog.status === 'published' ? 'open' : 'pending'}`}>
            {blog.status || 'published'}
          </span>
        </div>
        <div className="blog-dashboard-card-body">
          <div className="blog-dashboard-card-top">
            <div>
              <p className="eyebrow">{blog.author?.name || 'Pet Care Community'}</p>
              <h3>{blog.title}</h3>
            </div>
            {isOwner && (
              <div className="blog-dashboard-actions">
                <button type="button" className="primary-button compact" onClick={() => openEditModal(blog)}>
                  <Edit2 size={14} /> Edit
                </button>
                <button type="button" className="danger-button compact" onClick={() => handleDeleteBlog(blog._id)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
          <div className="blog-dashboard-meta">
            <span><Calendar size={14} /> {new Date(blog.createdAt).toLocaleDateString()}</span>
            <span><Heart size={14} /> {blog.likes?.length || 0}</span>
            <span><MessageCircle size={14} /> {blog.comments?.length || 0}</span>
          </div>
          <p className="blog-dashboard-excerpt">{buildExcerpt(blog.body)}</p>
          {!!blog.tags?.length && (
            <div className="tag-list blog-tag-list">
              {blog.tags.map((tag) => <span key={`${blog._id}-${tag}`}>{tag}</span>)}
            </div>
          )}
        </div>
      </article>
    );
  }

  function renderBlogList(list, emptyText) {
    if (loading && list.length === 0) return <div className="blog-dashboard-empty">Loading blogs...</div>;
    if (list.length === 0) return <div className="blog-dashboard-empty">{emptyText}</div>;
    return <div className="blog-dashboard-grid">{list.map((blog) => renderBlogCard(blog))}</div>;
  }

  return (
    <div className="admin-main-modern blog-dashboard-section">
      <div className="admin-main-header blog-dashboard-header">
        <div>
          <p className="eyebrow">Social</p>
          <h1>Community Blogs</h1>
          <p>Read, create, and manage pet care blog posts.</p>
        </div>
        {canCreateBlog && (
          <button type="button" className="admin-btn primary" onClick={() => setActiveTab('create')}>
            <ImagePlus size={16} /> Add Blog Post
          </button>
        )}
      </div>

      {error && (
        <div className="admin-alert error blog-dashboard-alert">
          {error}
          <button type="button" onClick={() => setError('')}>x</button>
        </div>
      )}
      {success && (
        <div className="admin-alert success blog-dashboard-alert">
          {success}
          <button type="button" onClick={() => setSuccess('')}>x</button>
        </div>
      )}

      <div className="blog-dashboard-tabs" role="tablist" aria-label="Community blog sections">
        <button type="button" className={activeTab === 'browse' ? 'active' : ''} onClick={() => setActiveTab('browse')}>
          Browse Blogs
        </button>
        <button type="button" className={activeTab === 'myblogs' ? 'active' : ''} onClick={() => setActiveTab('myblogs')}>
          My Blogs <span>{userBlogs.length}</span>
        </button>
        {canCreateBlog && (
          <button type="button" className={activeTab === 'create' ? 'active' : ''} onClick={() => setActiveTab('create')}>
            Add Blog Post
          </button>
        )}
      </div>

      {activeTab === 'browse' && (
        <section className="blog-dashboard-panel">
          <div className="blog-dashboard-panel-head">
            <h2>All Blog Posts</h2>
            <p>{blogs.length} published posts</p>
          </div>
          {renderBlogList(blogs, 'No blogs published yet.')}
        </section>
      )}

      {activeTab === 'myblogs' && (
        <section className="blog-dashboard-panel">
          <div className="blog-dashboard-panel-head">
            <h2>My Blogs</h2>
            <p>{userBlogs.length} posts created by you</p>
          </div>
          {renderBlogList(userBlogs, "You haven't created any blogs yet.")}
        </section>
      )}

      {canCreateBlog && activeTab === 'create' && (
        <section className="blog-dashboard-compose module-card">
          <div>
            <p className="eyebrow">Create</p>
            <h2>Create New Blog Post</h2>
            <p>Share care tips, stories, and helpful updates with the pet owner community.</p>
          </div>
          {renderBlogForm(form, setForm, handleCreateBlog, 'Publish Blog', 'create')}
        </section>
      )}

      {showEditModal && (
        <div className="modal-backdrop" onClick={() => setShowEditModal(false)}>
          <div className="modal-content blog-dashboard-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Blog Post</h2>
              <button className="modal-close" onClick={() => setShowEditModal(false)} type="button">
                <X />
              </button>
            </div>
            <div className="modal-body">
              {renderBlogForm(editForm, setEditForm, handleEditBlog, 'Save Changes', 'edit')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
