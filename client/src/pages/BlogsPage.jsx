import { useEffect, useMemo, useState } from "react";
import { Calendar, CircleAlert, PlusCircle, Send, ShieldCheck } from "lucide-react";
import api from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";

const emptyForm = { title: "", body: "", tags: "", status: "published" };

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

  const visibleBlogs = useMemo(() => blogs, [blogs]);

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
      <div className="module-detail-hero">
        <div>
          <p className="eyebrow">Blogs</p>
          <h1>Pet care stories and updates</h1>
          <p>Read published updates from the admin team and the platform community.</p>
        </div>
      </div>

      {status && <div className="community-alert success">{status}</div>}
      {error && <div className="community-alert error"><CircleAlert size={16} /> {error}</div>}

      {isAdmin && (
        <article className="composer-card">
          <h2><PlusCircle size={18} /> Publish blog post</h2>
          <form className="composer-form" onSubmit={submitBlog}>
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
              rows={5}
              value={form.body}
              onChange={(event) => setForm({ ...form, body: event.target.value })}
              placeholder="Write the blog content..."
            />
            <label>
              Status
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
      )}

      <div className="community-feed">
        {loading && visibleBlogs.length === 0 && <p>Loading blogs...</p>}
        {visibleBlogs.map((blog) => (
          <article key={blog._id} className="community-card">
            <div className="card-head">
              <div>
                <h3>{blog.title}</h3>
                <p>
                  {blog.author?.name || "Admin"} · {new Date(blog.createdAt).toLocaleDateString()}
                </p>
              </div>
              <span className={`status-pill ${blog.status}`}>{blog.status}</span>
            </div>
            <p className="card-body">{blog.body}</p>
            <div className="tag-list">
              {(blog.tags || []).map((tag) => <span key={`${blog._id}-${tag}`}>{tag}</span>)}
            </div>
            <div className="card-actions">
              <span><Calendar size={15} /> Blog post</span>
              {blog.status === "published" && <span><ShieldCheck size={15} /> Live</span>}
            </div>
          </article>
        ))}
        {!loading && visibleBlogs.length === 0 && <p>No blogs published yet.</p>}
      </div>
    </section>
  );
}