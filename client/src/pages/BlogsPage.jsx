import { useEffect, useMemo, useState } from "react";
import { CircleAlert, Eye, Heart, MessageCircle, PlusCircle, Send, ShieldCheck } from "lucide-react";
import api from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import { DEFAULT_IMAGE_FALLBACK, getUploadUrl } from "../utils/media.js";

const emptyForm = { title: "", body: "", tags: "", status: "published" };

function buildExcerpt(body = "", maxLength = 190) {
  const text = String(body).replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export default function BlogsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [blogs, setBlogs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadBlogs() {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/blogs");
      const items = (data.items || []).filter((item) => isAdmin || item.status === "published");
      setBlogs(items);
    } catch (loadError) {
      setError(loadError.response?.data?.message || "Failed to load blogs");
    } finally {
      setLoading(false);
    }
  }

  const featuredBlog = useMemo(() => blogs[0] || null, [blogs]);
  const sideBlogs = useMemo(() => blogs.slice(1, 4), [blogs]);
  const visibleBlogs = useMemo(() => blogs.slice(4), [blogs]);

  const handleImageError = (event) => {
    if (event.currentTarget.src !== DEFAULT_IMAGE_FALLBACK) {
      event.currentTarget.src = DEFAULT_IMAGE_FALLBACK;
    }
  };

  async function submitBlog(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setStatus("");
    try {
      await api.post("/blogs", {
        title: form.title,
        body: form.body,
        tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
        status: form.status
      });
      setForm(emptyForm);
      setStatus("Blog published");
      await loadBlogs();
    } catch (postError) {
      setError(postError.response?.data?.message || "Failed to publish blog");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="section blog-page">
      <div className="blog-page-header">
        <p className="eyebrow">Blogs</p>
        <h1>Recent blog posts</h1>
        <p>Read editorial stories, care guides, and platform updates in a clean magazine-style layout.</p>
      </div>

      <div className="blog-showcase">
        {featuredBlog ? (
          <article className="blog-featured-card blog-featured-hero">
            <div className="blog-featured-image-wrap">
              <img
                src={getUploadUrl(featuredBlog.image, "https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=1200&q=85")}
                alt={featuredBlog.title}
                className="blog-featured-image"
                onError={handleImageError}
              />
              <span className={`status-pill ${featuredBlog.status}`}>{featuredBlog.status}</span>
            </div>
            <div className="blog-featured-body">
              <div className="blog-card-topline">
                <span className="blog-author">{featuredBlog.author?.name || "Admin"}</span>
                <span className="blog-date">{new Date(featuredBlog.createdAt).toLocaleDateString()}</span>
              </div>
              <h2>{featuredBlog.title}</h2>
              <p className="blog-excerpt">{buildExcerpt(featuredBlog.body, 220)}</p>
              <div className="tag-list blog-tag-list">
                {(featuredBlog.tags || []).map((tag) => <span key={`${featuredBlog._id}-${tag}`}>{tag}</span>)}
              </div>
            </div>
          </article>
        ) : (
          <article className="blog-featured-card blog-featured-hero empty">
            <div className="blog-featured-body">
              <p className="eyebrow">Recent blog posts</p>
              <h2>No posts yet</h2>
              <p className="blog-excerpt">The first post will appear here once the editorial feed is populated.</p>
            </div>
          </article>
        )}

        <div className="blog-side-list">
          {sideBlogs.map((blog) => (
            <article key={blog._id} className="blog-side-card">
              <div className="blog-side-image-wrap">
                <img
                  src={getUploadUrl(blog.image, "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85")}
                  alt={blog.title}
                  className="blog-side-image"
                  onError={handleImageError}
                />
              </div>
              <div className="blog-side-body">
                <div className="blog-card-topline">
                  <span className="blog-author">{blog.author?.name || "Admin"}</span>
                  <span className="blog-date">{new Date(blog.createdAt).toLocaleDateString()}</span>
                </div>
                <h3>{blog.title}</h3>
                <p>{buildExcerpt(blog.body, 110)}</p>
                <div className="tag-list blog-tag-list">
                  {(blog.tags || []).map((tag) => <span key={`${blog._id}-${tag}`}>{tag}</span>)}
                </div>
              </div>
            </article>
          ))}
          {!sideBlogs.length && featuredBlog && <p className="blog-empty-note">More posts will appear here soon.</p>}
        </div>
      </div>

      {status && <div className="community-alert success">{status}</div>}
      {error && <div className="community-alert error"><CircleAlert size={16} /> {error}</div>}

      <div className={`blog-layout ${isAdmin ? "blog-layout-admin" : ""}`}>
        <div className="blog-feed-column">
          <div className="blog-grid">
            {loading && visibleBlogs.length === 0 && <p>Loading blogs...</p>}
            {visibleBlogs.map((blog) => (
              <article key={blog._id} className="blog-card blog-card-compact">
                <div className="blog-card-image-wrap">
                  <img
                    src={getUploadUrl(blog.image, "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1000&q=85")}
                    alt={blog.title}
                    className="blog-card-image"
                    onError={handleImageError}
                  />
                  <span className={`status-pill ${blog.status}`}>{blog.status}</span>
                </div>
                <div className="blog-card-body">
                  <div className="blog-card-topline">
                    <span className="blog-author">{blog.author?.name || "Admin"}</span>
                    <span className="blog-date">{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3>{blog.title}</h3>
                  <p>{buildExcerpt(blog.body, 130)}</p>
                  <div className="tag-list blog-tag-list">
                    {(blog.tags || []).map((tag) => <span key={`${blog._id}-${tag}`}>{tag}</span>)}
                  </div>
                  <div className="blog-card-actions">
                    <span><Eye size={15} /> Read post</span>
                    <span><Heart size={15} /> {blog.likes?.length || 0}</span>
                    <span><MessageCircle size={15} /> {blog.comments?.length || 0}</span>
                  </div>
                </div>
              </article>
            ))}
            {!loading && visibleBlogs.length === 0 && <p className="blog-empty-note">No blogs published yet.</p>}
          </div>
        </div>

        {isAdmin && (
          <aside className="blog-composer-panel">
            <article className="composer-card blog-composer-card">
              <div className="blog-card-topline">
                <p className="eyebrow">Editor tools</p>
                <ShieldCheck size={18} />
              </div>
              <h2><PlusCircle size={18} /> Publish blog post</h2>
              <p>Write an update, attach tags, and publish it to the public feed.</p>
              <form className="composer-form blog-composer-form" onSubmit={submitBlog}>
                <input
                  required
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Blog title"
                />
                <input
                  value={form.tags}
                  onChange={(event) => setForm({ ...form, tags: event.target.value })}
                  placeholder="Tags: grooming, nutrition, adoption"
                />
                <textarea
                  required
                  rows={8}
                  value={form.body}
                  onChange={(event) => setForm({ ...form, body: event.target.value })}
                  placeholder="Write the blog content..."
                />
                <label className="blog-composer-field">
                  <span>Status</span>
                  <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="flagged">Flagged</option>
                  </select>
                </label>
                <button className="primary-button" disabled={loading} type="submit">
                  <Send size={16} /> Publish
                </button>
              </form>
            </article>
          </aside>
        )}
      </div>
    </section>
  );
}