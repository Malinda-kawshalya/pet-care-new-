import { useEffect, useMemo, useState } from "react";
import { MessageSquare, ThumbsUp, Send, Shield, PlusCircle, Trash2, Flag } from "lucide-react";
import api from "../services/api.js";
import { useAuth } from "../hooks/useAuth.js";
import "../styles/community.css";

export default function Community() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState("posts");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [posts, setPosts] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [queue, setQueue] = useState({ draftPosts: [], flaggedPosts: [], flaggedDiscussions: [], totals: {} });

  const [postForm, setPostForm] = useState({ title: "", body: "", tags: "" });
  const [discussionForm, setDiscussionForm] = useState({ title: "", body: "", tags: "" });

  const [commentDrafts, setCommentDrafts] = useState({});
  const [replyDrafts, setReplyDrafts] = useState({});

  useEffect(() => {
    loadPosts();
    loadDiscussions();
    if (isAdmin) loadModerationQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function flash(message) {
    setSuccess(message);
    setTimeout(() => setSuccess(""), 2200);
  }

  async function run(task) {
    setLoading(true);
    setError("");
    try {
      await task();
    } catch (err) {
      setError(err.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  }

  async function loadPosts() {
    await run(async () => {
      const res = await api.get("/community/posts");
      setPosts(res.data.items || []);
    });
  }

  async function loadDiscussions() {
    await run(async () => {
      const res = await api.get("/community/discussions");
      setDiscussions(res.data.items || []);
    });
  }

  async function loadModerationQueue() {
    if (!isAdmin) return;
    await run(async () => {
      const res = await api.get("/community/moderation-queue");
      setQueue(res.data);
    });
  }

  async function createPost(e) {
    e.preventDefault();
    await run(async () => {
      const payload = {
        title: postForm.title,
        body: postForm.body,
        tags: postForm.tags.split(",").map((x) => x.trim()).filter(Boolean)
      };
      await api.post("/community/posts", payload);
      setPostForm({ title: "", body: "", tags: "" });
      flash("Post published");
      await loadPosts();
    });
  }

  async function createDiscussion(e) {
    e.preventDefault();
    await run(async () => {
      const payload = {
        title: discussionForm.title,
        body: discussionForm.body,
        tags: discussionForm.tags.split(",").map((x) => x.trim()).filter(Boolean)
      };
      await api.post("/community/discussions", payload);
      setDiscussionForm({ title: "", body: "", tags: "" });
      flash("Discussion created");
      await loadDiscussions();
    });
  }

  async function likePost(postId) {
    await run(async () => {
      await api.post(`/community/posts/${postId}/like`);
      await loadPosts();
    });
  }

  async function commentOnPost(postId) {
    const body = commentDrafts[postId]?.trim();
    if (!body) return;
    await run(async () => {
      await api.post(`/community/posts/${postId}/comments`, { body });
      setCommentDrafts((prev) => ({ ...prev, [postId]: "" }));
      flash("Comment added");
      await loadPosts();
    });
  }

  async function deletePostComment(postId, commentId) {
    await run(async () => {
      await api.delete(`/community/posts/${postId}/comments/${commentId}`);
      flash("Comment removed");
      await loadPosts();
    });
  }

  async function likeDiscussion(id) {
    await run(async () => {
      await api.post(`/community/discussions/${id}/like`);
      await loadDiscussions();
    });
  }

  async function replyDiscussion(id) {
    const body = replyDrafts[id]?.trim();
    if (!body) return;
    await run(async () => {
      await api.post(`/community/discussions/${id}/replies`, { body });
      setReplyDrafts((prev) => ({ ...prev, [id]: "" }));
      flash("Reply posted");
      await loadDiscussions();
    });
  }

  async function deleteDiscussionReply(id, replyId) {
    await run(async () => {
      await api.delete(`/community/discussions/${id}/replies/${replyId}`);
      flash("Reply removed");
      await loadDiscussions();
    });
  }

  async function moderatePost(id, status) {
    await run(async () => {
      await api.patch(`/community/posts/${id}/moderate`, { status });
      flash(`Post marked ${status}`);
      await Promise.all([loadPosts(), loadModerationQueue()]);
    });
  }

  async function moderateDiscussion(id, status) {
    await run(async () => {
      await api.patch(`/community/discussions/${id}/moderate`, { status });
      flash(`Discussion marked ${status}`);
      await Promise.all([loadDiscussions(), loadModerationQueue()]);
    });
  }

  const tabs = useMemo(() => {
    const base = [
      { key: "posts", label: "Blog Posts" },
      { key: "discussions", label: "Discussions" }
    ];
    if (isAdmin) base.push({ key: "moderation", label: "Moderation" });
    return base;
  }, [isAdmin]);

  return (
    <section className="community-page full-screen-section">
      <header className="community-hero">
        <div>
          <p className="eyebrow">Community Module</p>
          <h1>Pet Care Community</h1>
          <p>Read tips, publish experiences, comment, like, and join meaningful discussions.</p>
        </div>
      </header>

      {loading && <div className="community-alert info">Loading...</div>}
      {error && <div className="community-alert error">{error}</div>}
      {success && <div className="community-alert success">{success}</div>}

      <div className="community-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={activeTab === tab.key ? "active" : ""}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "posts" && (
        <>
          <article className="composer-card">
            <h2><PlusCircle size={18} /> Create Blog Post</h2>
            <form onSubmit={createPost} className="composer-form">
              <input
                value={postForm.title}
                onChange={(e) => setPostForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Post title"
                required
              />
              <input
                value={postForm.tags}
                onChange={(e) => setPostForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="Tags: grooming, nutrition, rescue"
              />
              <textarea
                value={postForm.body}
                onChange={(e) => setPostForm((prev) => ({ ...prev, body: e.target.value }))}
                placeholder="Share your pet care tips or story..."
                rows={4}
                required
              />
              <button className="primary-button" type="submit"><Send size={16} /> Publish</button>
            </form>
          </article>

          <div className="community-feed">
            {posts.map((post) => (
              <article key={post._id} className="community-card">
                <div className="card-head">
                  <div>
                    <h3>{post.title}</h3>
                    <p>By {post.author?.name || "Unknown"} · {new Date(post.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`status-pill ${post.status}`}>{post.status}</span>
                </div>
                <p className="card-body">{post.body}</p>
                <div className="tag-list">
                  {(post.tags || []).map((tag) => (
                    <span key={`${post._id}-${tag}`}>{tag}</span>
                  ))}
                </div>
                <div className="card-actions">
                  <button onClick={() => likePost(post._id)}><ThumbsUp size={15} /> {post.likes?.length || 0}</button>
                  <span><MessageSquare size={15} /> {post.comments?.length || 0}</span>
                  {isAdmin && (
                    <>
                      <button onClick={() => moderatePost(post._id, "published")}><Shield size={15} /> Approve</button>
                      <button onClick={() => moderatePost(post._id, "flagged")}><Flag size={15} /> Flag</button>
                    </>
                  )}
                </div>

                <div className="comment-zone">
                  {(post.comments || []).map((comment) => (
                    <div key={comment._id} className="comment-item">
                      <div>
                        <strong>{comment.user?.name || "User"}</strong>
                        <p>{comment.body}</p>
                      </div>
                      {(isAdmin || comment.user?._id === user?.id) && (
                        <button className="danger" onClick={() => deletePostComment(post._id, comment._id)}><Trash2 size={14} /></button>
                      )}
                    </div>
                  ))}
                  <div className="comment-composer">
                    <input
                      value={commentDrafts[post._id] || ""}
                      onChange={(e) => setCommentDrafts((prev) => ({ ...prev, [post._id]: e.target.value }))}
                      placeholder="Write a comment"
                    />
                    <button onClick={() => commentOnPost(post._id)}>Comment</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {activeTab === "discussions" && (
        <>
          <article className="composer-card">
            <h2><PlusCircle size={18} /> Start Discussion</h2>
            <form onSubmit={createDiscussion} className="composer-form">
              <input
                value={discussionForm.title}
                onChange={(e) => setDiscussionForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Discussion topic"
                required
              />
              <input
                value={discussionForm.tags}
                onChange={(e) => setDiscussionForm((prev) => ({ ...prev, tags: e.target.value }))}
                placeholder="Tags: first-dog, vet-advice"
              />
              <textarea
                value={discussionForm.body}
                onChange={(e) => setDiscussionForm((prev) => ({ ...prev, body: e.target.value }))}
                placeholder="Describe your question or advice..."
                rows={4}
                required
              />
              <button className="primary-button" type="submit"><Send size={16} /> Create</button>
            </form>
          </article>

          <div className="community-feed">
            {discussions.map((topic) => (
              <article key={topic._id} className="community-card">
                <div className="card-head">
                  <div>
                    <h3>{topic.title}</h3>
                    <p>By {topic.author?.name || "Unknown"} · {new Date(topic.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`status-pill ${topic.status}`}>{topic.status}</span>
                </div>
                <p className="card-body">{topic.body}</p>
                <div className="tag-list">
                  {(topic.tags || []).map((tag) => (
                    <span key={`${topic._id}-${tag}`}>{tag}</span>
                  ))}
                </div>
                <div className="card-actions">
                  <button onClick={() => likeDiscussion(topic._id)}><ThumbsUp size={15} /> {topic.likes?.length || 0}</button>
                  <span><MessageSquare size={15} /> {topic.replies?.length || 0}</span>
                  {isAdmin && (
                    <>
                      <button onClick={() => moderateDiscussion(topic._id, "open")}><Shield size={15} /> Open</button>
                      <button onClick={() => moderateDiscussion(topic._id, "removed")}><Flag size={15} /> Remove</button>
                    </>
                  )}
                </div>

                <div className="comment-zone">
                  {(topic.replies || []).map((reply) => (
                    <div key={reply._id} className="comment-item">
                      <div>
                        <strong>{reply.user?.name || "User"}</strong>
                        <p>{reply.body}</p>
                      </div>
                      {(isAdmin || reply.user?._id === user?.id) && (
                        <button className="danger" onClick={() => deleteDiscussionReply(topic._id, reply._id)}><Trash2 size={14} /></button>
                      )}
                    </div>
                  ))}
                  <div className="comment-composer">
                    <input
                      value={replyDrafts[topic._id] || ""}
                      onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [topic._id]: e.target.value }))}
                      placeholder="Reply to discussion"
                    />
                    <button onClick={() => replyDiscussion(topic._id)}>Reply</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </>
      )}

      {activeTab === "moderation" && isAdmin && (
        <section className="moderation-panel">
          <h2><Shield size={18} /> Admin Moderation Queue</h2>
          <div className="moderation-stats">
            <article><strong>{queue.totals?.draftPosts || 0}</strong><span>Draft Posts</span></article>
            <article><strong>{queue.totals?.flaggedPosts || 0}</strong><span>Flagged Posts</span></article>
            <article><strong>{queue.totals?.flaggedDiscussions || 0}</strong><span>Flagged Discussions</span></article>
          </div>

          <div className="moderation-list">
            {queue.flaggedPosts.map((post) => (
              <div key={post._id} className="moderation-item">
                <div>
                  <h3>{post.title}</h3>
                  <p>{post.author?.name}</p>
                </div>
                <div className="moderation-actions">
                  <button onClick={() => moderatePost(post._id, "published")}>Restore</button>
                  <button className="danger" onClick={() => moderatePost(post._id, "flagged")}>Keep Flagged</button>
                </div>
              </div>
            ))}

            {queue.flaggedDiscussions.map((topic) => (
              <div key={topic._id} className="moderation-item">
                <div>
                  <h3>{topic.title}</h3>
                  <p>{topic.author?.name}</p>
                </div>
                <div className="moderation-actions">
                  <button onClick={() => moderateDiscussion(topic._id, "open")}>Restore</button>
                  <button className="danger" onClick={() => moderateDiscussion(topic._id, "removed")}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
