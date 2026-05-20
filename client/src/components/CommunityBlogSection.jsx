import { useState, useEffect } from 'react';
import { Edit2, Trash2, Send, X, Calendar, Heart, MessageCircle, ImagePlus } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { getUploadUrl } from '../utils/media';

const emptyBlogForm = { title: '', body: '', tags: '', image: '' };

function buildExcerpt(body = '', maxLength = 150) {
  const text = String(body).replace(/\s+/g, ' ').trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
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

  function flashMessage(msg, isError = false) {
    if (isError) {
      setError(msg);
      setTimeout(() => setError(''), 3000);
    } else {
      setSuccess(msg);
      setTimeout(() => setSuccess(''), 3000);
    }
  }

  async function loadBlogs() {
    setLoading(true);
    try {
      const { data } = await api.get('/blogs');
      const allBlogs = (data.items || []).filter(blog => blog.status === 'published');
      setBlogs(allBlogs);
      
      // Filter user's own blogs
      if (user?.id) {
        const myBlogs = (data.items || []).filter(blog => String(blog.author?._id || blog.author?.id || blog.author) === String(user.id));
        setUserBlogs(myBlogs);
      } else {
        setUserBlogs([]);
      }
    } catch (err) {
      flashMessage(err.response?.data?.message || 'Failed to load blogs', true);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateBlog(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      flashMessage('Title and body are required', true);
      return;
    }

    setLoading(true);
    try {
      await api.post('/blogs', {
        title: form.title,
        body: form.body,
        tags: form.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        image: form.image,
        status: 'published'
      });
      setForm(emptyBlogForm);
      flashMessage('Blog published successfully!');
      setActiveTab('myblogs');
      await loadBlogs();
    } catch (err) {
      flashMessage(err.response?.data?.message || 'Failed to publish blog', true);
    } finally {
      setLoading(false);
    }
  }

  async function handleEditBlog(e) {
    e.preventDefault();
    if (!editForm.title.trim() || !editForm.body.trim()) {
      flashMessage('Title and body are required', true);
      return;
    }

    setLoading(true);
    try {
      await api.put(`/blogs/${editingBlogId}`, {
        title: editForm.title,
        body: editForm.body,
        tags: editForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        image: editForm.image
      });
      setShowEditModal(false);
      setEditingBlogId(null);
      setEditForm(emptyBlogForm);
      flashMessage('Blog updated successfully!');
      await loadBlogs();
    } catch (err) {
      flashMessage(err.response?.data?.message || 'Failed to update blog', true);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteBlog(blogId) {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    
    setLoading(true);
    try {
      await api.delete(`/blogs/${blogId}`);
      flashMessage('Blog deleted successfully!');
      await loadBlogs();
    } catch (err) {
      flashMessage(err.response?.data?.message || 'Failed to delete blog', true);
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
        if (target === 'edit') {
          setEditForm((current) => ({ ...current, image: path }));
        } else {
          setForm((current) => ({ ...current, image: path }));
        }
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
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
          Blog Photo
        </label>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 14px',
            backgroundColor: '#eef6ff',
            color: '#0066cc',
            border: '1px solid #cfe3ff',
            borderRadius: '4px',
            cursor: uploadingImage ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          <ImagePlus size={16} /> {uploadingImage ? 'Uploading...' : currentForm.image ? 'Change Photo' : 'Add Photo'}
          <input
            type="file"
            accept="image/*"
            disabled={uploadingImage}
            onChange={(event) => uploadBlogImage(event, target)}
            style={{ display: 'none' }}
          />
        </label>
        {currentForm.image && (
          <div style={{ marginTop: '12px' }}>
            <img
              src={getUploadUrl(currentForm.image)}
              alt="Blog preview"
              style={{ width: '100%', maxHeight: '260px', objectFit: 'cover', borderRadius: '6px', display: 'block' }}
            />
            <button
              type="button"
              onClick={() => setCurrentForm((current) => ({ ...current, image: '' }))}
              style={{
                marginTop: '8px',
                padding: '7px 12px',
                backgroundColor: '#f0f0f0',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Remove Photo
            </button>
          </div>
        )}
      </div>
    );
  }

  const renderBlogCard = (blog, showActions = false) => (
    <article key={blog._id} className="blog-card-compact" style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: '#fff'
    }}>
      {blog.image && (
        <img
          src={getUploadUrl(blog.image)}
          alt={blog.title}
          style={{
            width: '100%',
            height: '220px',
            objectFit: 'cover',
            borderRadius: '6px',
            marginBottom: '14px',
            display: 'block'
          }}
        />
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <div>
          <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>{blog.title}</h3>
          <div style={{ display: 'flex', gap: '12px', fontSize: '13px', color: '#666' }}>
            <span><Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />{new Date(blog.createdAt).toLocaleDateString()}</span>
            <span><Heart size={14} style={{ display: 'inline', marginRight: '4px' }} />{blog.likes?.length || 0}</span>
            <span><MessageCircle size={14} style={{ display: 'inline', marginRight: '4px' }} />{blog.comments?.length || 0}</span>
          </div>
        </div>
        {(showActions || String(blog.author?._id || blog.author?.id || blog.author) === String(user?.id)) && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => openEditModal(blog)}
              style={{
                padding: '6px 10px',
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px'
              }}
            >
              <Edit2 size={14} /> Edit
            </button>
            <button
              onClick={() => handleDeleteBlog(blog._id)}
              style={{
                padding: '6px 10px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '13px'
              }}
            >
              <Trash2 size={14} /> Delete
            </button>
          </div>
        )}
      </div>
      <p style={{ margin: '0 0 12px 0', color: '#555', lineHeight: '1.5' }}>{buildExcerpt(blog.body)}</p>
      {blog.tags && blog.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {blog.tags.map(tag => (
            <span
              key={`${blog._id}-${tag}`}
              style={{
                display: 'inline-block',
                padding: '4px 10px',
                backgroundColor: '#e8f0ff',
                color: '#0066cc',
                borderRadius: '12px',
                fontSize: '12px'
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );

  return (
    <div className="admin-main-modern">
      <div className="admin-main-header">
        <div>
          <h1>Community Blogs</h1>
          <p>Read, create, and manage pet care blog posts</p>
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fee',
          color: '#c33',
          borderRadius: '4px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {error}
          <button onClick={() => setError('')} style={{ background: 'none', border: 'none', color: '#c33', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {success && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#efe',
          color: '#3c3',
          borderRadius: '4px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {success}
          <button onClick={() => setSuccess('')} style={{ background: 'none', border: 'none', color: '#3c3', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid #e0e0e0' }}>
        <button
          onClick={() => setActiveTab('browse')}
          style={{
            padding: '12px 16px',
            backgroundColor: activeTab === 'browse' ? '#0066cc' : 'transparent',
            color: activeTab === 'browse' ? 'white' : '#666',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'browse' ? '600' : 'normal',
            borderRadius: '4px 4px 0 0'
          }}
        >
          Browse Blogs
        </button>
        <button
          onClick={() => setActiveTab('myblogs')}
          style={{
            padding: '12px 16px',
            backgroundColor: activeTab === 'myblogs' ? '#0066cc' : 'transparent',
            color: activeTab === 'myblogs' ? 'white' : '#666',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'myblogs' ? '600' : 'normal',
            borderRadius: '4px 4px 0 0'
          }}
        >
          My Blogs
        </button>
        {canCreateBlog && (
          <button
            onClick={() => setActiveTab('create')}
            style={{
              padding: '12px 16px',
              backgroundColor: activeTab === 'create' ? '#0066cc' : 'transparent',
              color: activeTab === 'create' ? 'white' : '#666',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: activeTab === 'create' ? '600' : 'normal',
              borderRadius: '4px 4px 0 0'
            }}
          >
            Add Blog Post
          </button>
        )}
      </div>

      {activeTab === 'browse' && (
        <div style={{ maxWidth: '900px' }}>
          <h2 style={{ marginBottom: '16px' }}>All Blog Posts</h2>
          {loading && blogs.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '40px 20px' }}>Loading blogs...</p>
          ) : blogs.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '40px 20px' }}>No blogs published yet.</p>
          ) : (
            blogs.map(blog => renderBlogCard(blog))
          )
        }
        </div>
      )}

      {activeTab === 'myblogs' && (
        <div style={{ maxWidth: '900px' }}>
          <h2 style={{ marginBottom: '16px' }}>My Blogs ({userBlogs.length})</h2>
          {userBlogs.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#999', padding: '40px 20px' }}>You haven't created any blogs yet.</p>
          ) : (
            userBlogs.map(blog => renderBlogCard(blog))
          )}
        </div>
      )}

      {canCreateBlog && activeTab === 'create' && (
        <div style={{ maxWidth: '700px' }}>
          <h2 style={{ marginBottom: '20px' }}>Create New Blog Post</h2>
          <article style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '24px',
            backgroundColor: '#f9f9f9'
          }}>
            <form onSubmit={handleCreateBlog}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                  Blog Title
                </label>
                <input
                  type="text"
                  placeholder="Enter blog title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., grooming, nutrition, health"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {renderPhotoField(form, setForm, 'create')}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                  Blog Content
                </label>
                <textarea
                  placeholder="Write your blog post content..."
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  required
                  rows={8}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  backgroundColor: loading ? '#999' : '#0066cc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <Send size={16} /> {loading ? 'Publishing...' : 'Publish Blog'}
              </button>
            </form>
          </article>
        </div>
      )}

      {showEditModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '700px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0 }}>Edit Blog Post</h2>
              <button
                onClick={() => setShowEditModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  color: '#666',
                  cursor: 'pointer'
                }}
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleEditBlog}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                  Blog Title
                </label>
                <input
                  type="text"
                  placeholder="Enter blog title"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., grooming, nutrition, health"
                  value={editForm.tags}
                  onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {renderPhotoField(editForm, setEditForm, 'edit')}

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
                  Blog Content
                </label>
                <textarea
                  placeholder="Write your blog post content..."
                  value={editForm.body}
                  onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                  required
                  rows={8}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '14px',
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    boxSizing: 'border-box',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: loading ? '#999' : '#0066cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f0f0f0',
                    color: '#333',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
