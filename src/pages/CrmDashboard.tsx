import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchArticles, createArticle, updateArticle, deleteArticle, approveArticle, rejectArticle } from "../api";
import type { Article } from "../data/articles";

export const CrmDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Drawer UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  // Form Fields
  const [formId, setFormId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formCategory, setFormCategory] = useState("Tech");
  const [formImage, setFormImage] = useState("");
  const [formVideoSrc, setFormVideoSrc] = useState("");
  const [formVideoPoster, setFormVideoPoster] = useState("");
  const [formContent, setFormContent] = useState("");
  
  // Toggles
  const [formFeatured, setFormFeatured] = useState(false);
  const [formTrending, setFormTrending] = useState(false);
  const [formIsPartner, setFormIsPartner] = useState(false);

  // Author details (used by super_admin to customize, otherwise auto-filled)
  const [formAuthorName, setFormAuthorName] = useState("Editorial Board");
  const [formAuthorRole, setFormAuthorRole] = useState("Senior Editor");
  const [formAuthorAvatar, setFormAuthorAvatar] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
  );

  // Fetch articles based on active session role
  const loadArticles = (user: any) => {
    if (!user) return;
    setLoading(true);
    const params = {
      editorMode: true,
      role: user.role,
      authorUsername: user.username,
      authorName: user.name
    };
    
    fetchArticles(undefined, params)
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("⚠️ Failed to load articles in CRM:", err);
        setErrorMsg("Failed to fetch articles. Please ensure the backend is running.");
        setLoading(false);
      });
  };

  // Redirect to login on mount if session is not active
  useEffect(() => {
    const stored = localStorage.getItem("editorUser");
    if (!stored) {
      navigate("/login");
      return;
    }
    try {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      loadArticles(user);
    } catch (e) {
      localStorage.removeItem("editorUser");
      localStorage.removeItem("authToken");
      window.dispatchEvent(new Event("storage"));
      navigate("/login");
    }
  }, [navigate]);

  // Show a temporary success message
  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  // Open drawer for Write new article
  const handleOpenCreate = () => {
    if (!currentUser) return;
    
    setEditingArticle(null);
    setFormId("");
    setFormTitle("");
    setFormSummary("");
    setFormCategory("Tech");
    setFormImage("");
    setFormVideoSrc("");
    setFormVideoPoster("");
    setFormContent("");
    setFormFeatured(false);
    setFormTrending(false);
    setFormIsPartner(false);
    
    // Auto fill based on logged-in author
    setFormAuthorName(currentUser.name);
    setFormAuthorRole(
      currentUser.role === "super_admin"
        ? "Chief Editor"
        : currentUser.name === "Robert Fox"
        ? "Tech writer"
        : "Art Director"
    );
    setFormAuthorAvatar(currentUser.avatar);
    
    setErrorMsg("");
    setIsDrawerOpen(true);
  };

  // Open drawer for editing an article
  const handleOpenEdit = (art: Article) => {
    setEditingArticle(art);
    setFormId(art.id);
    setFormTitle(art.title);
    setFormSummary(art.summary);
    setFormCategory(art.category);
    setFormImage(art.image || "");
    setFormVideoSrc(art.video?.src || "");
    setFormVideoPoster(art.video?.poster || "");
    setFormContent(art.content.join("\n\n"));
    setFormFeatured(!!art.featured);
    setFormTrending(!!art.trending);
    setFormIsPartner(!!art.isPartner);
    setFormAuthorName(art.author?.name || "Editorial Board");
    setFormAuthorRole(art.author?.role || "Editor");
    setFormAuthorAvatar(
      art.author?.avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
    );
    setErrorMsg("");
    setIsDrawerOpen(true);
  };

  // Delete article triggers
  const handleDelete = async (id: string) => {
    if (!currentUser) return;
    
    if (!window.confirm("Are you sure you want to delete this article? This action cannot be undone.")) {
      return;
    }

    try {
      const userParams = {
        role: currentUser.role,
        authorUsername: currentUser.username,
        authorName: currentUser.name
      };
      await deleteArticle(id, userParams);
      triggerSuccess("Article deleted successfully.");
      loadArticles(currentUser);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to delete article: " + err.message);
    }
  };

  // Approve pending article (admin only)
  const handleApprove = async (id: string) => {
    if (!currentUser || currentUser.role !== "super_admin") return;
    try {
      await approveArticle(id, currentUser.role);
      triggerSuccess("Article approved and published successfully.");
      loadArticles(currentUser);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to approve article: " + err.message);
    }
  };

  // Reject pending article (admin only)
  const handleReject = async (id: string) => {
    if (!currentUser || currentUser.role !== "super_admin") return;
    try {
      await rejectArticle(id, currentUser.role);
      triggerSuccess("Article marked as review pending (Rejected).");
      loadArticles(currentUser);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to reject article: " + err.message);
    }
  };

  // Auto-fill custom slug based on title input
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!editingArticle) {
      const slug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormId(slug);
    }
  };

  // Handle Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!currentUser) return;
    if (!formId.trim()) {
      setErrorMsg("Custom Slug ID is required.");
      return;
    }
    if (!formTitle.trim()) {
      setErrorMsg("Title is required.");
      return;
    }
    if (!formSummary.trim()) {
      setErrorMsg("Summary is required.");
      return;
    }
    if (!formContent.trim()) {
      setErrorMsg("Article body content is required.");
      return;
    }

    // Split content text area by double line breaks to reconstruct paragraphs
    const contentParagraphs = formContent
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    const videoObj = formVideoSrc.trim()
      ? {
          src: formVideoSrc.trim(),
          type: formVideoSrc.trim().endsWith(".m3u8") ? "application/x-mpegURL" : "video/mp4",
          poster: formVideoPoster.trim() || undefined
        }
      : undefined;

    const payload: any = {
      id: formId.trim(),
      title: formTitle.trim(),
      summary: formSummary.trim(),
      category: formCategory,
      content: contentParagraphs,
      image: formImage.trim() || undefined,
      video: videoObj,
      featured: formFeatured,
      trending: formTrending,
      isPartner: formIsPartner,
      authorName: formAuthorName.trim(),
      authorRole: formAuthorRole.trim(),
      authorAvatar: formAuthorAvatar.trim(),
      
      // Pass role security parameters
      role: currentUser.role,
      authorUsername: editingArticle ? editingArticle.authorUsername : currentUser.username,
      status: editingArticle ? editingArticle.status : (currentUser.role === "super_admin" ? "approved" : "pending")
    };

    try {
      if (editingArticle) {
        // Edit Action
        await updateArticle(editingArticle.id, payload);
        triggerSuccess(`Article "${formTitle}" updated successfully.`);
      } else {
        // Create Action
        const exists = articles.some((a) => a.id === payload.id);
        if (exists) {
          setErrorMsg(`An article with slug ID "${payload.id}" already exists. Please choose a different slug.`);
          return;
        }
        await createArticle(payload);
        triggerSuccess(`Article "${formTitle}" created successfully.`);
      }
      setIsDrawerOpen(false);
      loadArticles(currentUser);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to save article: ${err.message}`);
    }
  };

  // Calculated Stats
  const totalArticles = articles.length;
  const totalLikes = articles.reduce((sum, a) => sum + (a.likes || 0), 0);

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-8 border-x-[0.5px] border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
      
      {/* Top dashboard heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/"
              className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-455 dark:hover:text-neutral-100 transition-colors flex items-center gap-1.5"
            >
              <i className="fa-solid fa-arrow-left"></i>
              <span>Back to Magazine</span>
            </Link>
          </div>
          <h1 className="font-serif text-3xl font-black text-neutral-900 dark:text-neutral-55">
            CRM Editorial Board
          </h1>
          <p className="text-xs text-neutral-400 dark:text-neutral-550 mt-1 font-medium">
            {currentUser?.role === "super_admin" 
              ? "Super Admin Dashboard - Oversee all submissions, review draft requests, and publish editorial features."
              : `Author Panel - Hello, ${currentUser?.name}. Manage your contributions and draft write-ups.`
            }
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-955 text-xs font-bold rounded-full transition-all hover:opacity-90 flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <i className="fa-solid fa-pen-nib text-[10px]"></i>
          <span>Write Article</span>
        </button>
      </div>

      {/* Global Success / Alert Banner */}
      {successMsg && (
        <div className="mb-6 bg-emerald-50 dark:bg-emerald-950/20 border-[0.5px] border-emerald-200 dark:border-emerald-800 text-emerald-850 dark:text-emerald-400 text-xs font-bold py-3 px-4 rounded-xl flex items-center gap-2 animate-fade-in">
          <i className="fa-solid fa-circle-check text-sm"></i>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Analytics Feed Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Card 1: Total Published */}
        <div className="p-6 bg-neutral-50 dark:bg-neutral-900/30 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-400 dark:text-neutral-550 uppercase tracking-wider block">
              {currentUser?.role === "super_admin" ? "Total Publications" : "My Articles"}
            </span>
            <span className="font-serif text-3xl font-black text-neutral-850 dark:text-neutral-100 block mt-2">
              {loading ? "..." : totalArticles}
            </span>
          </div>
          <div className="w-12 h-12 bg-neutral-100 dark:bg-neutral-850 rounded-full flex items-center justify-center text-neutral-500 dark:text-neutral-400 border-[0.5px] border-neutral-200 dark:border-neutral-800">
            <i className="fa-solid fa-newspaper text-base"></i>
          </div>
        </div>

        {/* Card 2: Accumulated Likes */}
        <div className="p-6 bg-neutral-50 dark:bg-neutral-900/30 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-neutral-400 dark:text-neutral-550 uppercase tracking-wider block">
              Accumulated Likes
            </span>
            <span className="font-serif text-3xl font-black text-neutral-850 dark:text-neutral-100 block mt-2">
              {loading ? "..." : totalLikes}
            </span>
          </div>
          <div className="w-12 h-12 bg-red-50/50 dark:bg-red-950/10 rounded-full flex items-center justify-center text-red-500 border-[0.5px] border-red-100 dark:border-red-950/50">
            <i className="fa-solid fa-heart text-base"></i>
          </div>
        </div>
      </div>

      {/* Main Table view */}
      <div className="bg-white dark:bg-brand-dark border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 dark:border-white mx-auto mb-4"></div>
            <p className="font-serif italic text-sm text-neutral-500 uppercase tracking-wider">
              Syncing with Supabase Ledger...
            </p>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center text-neutral-505">
            <i className="fa-solid fa-box-open text-3xl mb-4 text-neutral-300 dark:text-neutral-700"></i>
            <p className="font-serif text-lg italic">No articles found in the database.</p>
            <button
              onClick={handleOpenCreate}
              className="mt-4 px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-full hover:opacity-90 cursor-pointer"
            >
              Write Your First Post
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 dark:bg-neutral-900/30 border-b-[0.5px] border-neutral-200 dark:border-neutral-800 text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 dark:text-neutral-500">
                  <th className="py-4 px-6">Article Description</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Status & Attributes</th>
                  <th className="py-4 px-6">Engagement</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-neutral-200 dark:divide-neutral-800">
                {articles.map((art) => (
                  <tr
                    key={art.id}
                    className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors text-sm text-neutral-800 dark:text-neutral-200"
                  >
                    {/* Article Info Column */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        {art.image ? (
                          <img
                            src={art.image}
                            alt=""
                            className="w-14 h-10 object-cover rounded-md border-[0.5px] border-neutral-200 dark:border-neutral-800 shrink-0"
                          />
                        ) : art.video ? (
                          <div className="w-14 h-10 bg-neutral-100 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-md flex items-center justify-center shrink-0 text-neutral-500">
                            <i className="fa-solid fa-video text-xs"></i>
                          </div>
                        ) : (
                          <div className="w-14 h-10 bg-neutral-100 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-md flex items-center justify-center shrink-0 text-neutral-350">
                            <i className="fa-solid fa-newspaper text-xs"></i>
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            to={`/article/${art.id}`}
                            className="font-bold text-neutral-850 dark:text-neutral-50 hover:text-accent-purple dark:hover:text-purple-400 block truncate max-w-sm sm:max-w-md md:max-w-lg"
                          >
                            {art.title}
                          </Link>
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium block mt-1">
                            Slug: {art.id} • Written by {art.author?.name || "Editorial"} • {art.date}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category Column */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-[10px] bg-neutral-100 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                        {art.category}
                      </span>
                    </td>

                    {/* Status & Attributes Column */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col gap-1.5 justify-center">
                        {/* Status indicators */}
                        <div>
                          {art.status === "approved" ? (
                            <span className="text-[9px] bg-emerald-500/10 border-[0.5px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
                              Approved
                            </span>
                          ) : art.status === "rejected" ? (
                            <span className="text-[9px] bg-red-500/10 border-[0.5px] border-red-500/30 text-red-600 dark:text-red-400 px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
                              Rejected
                            </span>
                          ) : (
                            <span className="text-[9px] bg-amber-500/10 border-[0.5px] border-amber-500/30 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider animate-pulse">
                              Pending Review
                            </span>
                          )}
                        </div>

                        {/* Layout tags */}
                        <div className="flex gap-1">
                          {art.featured && (
                            <span className="text-[8px] bg-amber-500/5 text-amber-550 dark:text-amber-400 px-1.5 py-0.2 rounded font-bold uppercase">
                              Featured
                            </span>
                          )}
                          {art.trending && (
                            <span className="text-[8px] bg-sky-500/5 text-sky-550 dark:text-sky-400 px-1.5 py-0.2 rounded font-bold uppercase">
                              Trending
                            </span>
                          )}
                          {art.isPartner && (
                            <span className="text-[8px] bg-emerald-500/5 text-emerald-550 dark:text-emerald-400 px-1.5 py-0.2 rounded font-bold uppercase">
                              Partner
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Engagement Count Column */}
                    <td className="py-4 px-6 whitespace-nowrap text-xs font-semibold text-neutral-500">
                      <span className="flex items-center gap-1">
                        <i className="fa-solid fa-heart text-[10px] text-red-400"></i>
                        <span>{art.likes || 0} Likes</span>
                      </span>
                    </td>

                    {/* Action Buttons Column */}
                    <td className="py-4 px-6 whitespace-nowrap text-right text-xs">
                      <div className="flex items-center justify-end gap-2.5">
                        
                        {/* Approval workflow buttons for admin */}
                        {currentUser?.role === "super_admin" && art.status === "pending" && (
                          <>
                            <button
                              onClick={() => handleApprove(art.id)}
                              className="w-8 h-8 rounded-full border-[0.5px] border-emerald-200 hover:bg-emerald-50 dark:border-emerald-950/40 dark:hover:bg-emerald-950/20 text-emerald-600 transition-colors flex items-center justify-center cursor-pointer"
                              title="Approve & Publish"
                            >
                              <i className="fa-solid fa-check text-xs"></i>
                            </button>
                            <button
                              onClick={() => handleReject(art.id)}
                              className="w-8 h-8 rounded-full border-[0.5px] border-red-200 hover:bg-red-50 dark:border-red-950/40 dark:hover:bg-red-950/20 text-red-650 transition-colors flex items-center justify-center cursor-pointer"
                              title="Reject Submission"
                            >
                              <i className="fa-solid fa-xmark text-xs"></i>
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => handleOpenEdit(art)}
                          className="w-8 h-8 rounded-full border-[0.5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors flex items-center justify-center cursor-pointer"
                          title="Edit publication"
                        >
                          <i className="fa-solid fa-pen text-[11px]"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(art.id)}
                          className="w-8 h-8 rounded-full border-[0.5px] border-red-100 dark:border-red-950/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-colors flex items-center justify-center cursor-pointer"
                          title="Delete publication"
                        >
                          <i className="fa-solid fa-trash-can text-[11px]"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ==========================================
          INTERACTIVE WRITE/EDIT DRAWER (RIGHT ALIGNED)
          ========================================== */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          {/* Backdrop layer */}
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="absolute inset-0 bg-neutral-950/45 dark:bg-black/65 backdrop-blur-sm transition-opacity"
          ></div>

          {/* Drawer container */}
          <div className="relative w-full max-w-2xl h-full bg-white dark:bg-brand-dark shadow-2xl border-l-[0.5px] border-neutral-200 dark:border-neutral-800 flex flex-col z-10 animate-slide-in">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b-[0.5px] border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50 dark:bg-neutral-900/30">
              <div>
                <h2 className="font-serif text-xl font-black text-neutral-900 dark:text-neutral-50">
                  {editingArticle ? "Modify Publication" : "Compose Editorial"}
                </h2>
                <p className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                  Ensure all compliance, grammar, and layout fields are satisfied.
                </p>
              </div>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-full border-[0.5px] border-neutral-200 dark:border-neutral-850 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 dark:text-neutral-400 flex items-center justify-center cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {/* Drawer Body Scroll */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Internal Drawer Error Notification */}
              {errorMsg && (
                <div className="bg-red-50 dark:bg-red-950/20 border-[0.5px] border-red-200 dark:border-red-950 text-red-750 dark:text-red-400 text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-2 animate-pulse">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-neutral-455 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How to create a mobile banking app in 2026..."
                  value={formTitle}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-850 dark:text-neutral-100"
                />
              </div>

              {/* Slug ID (Static when editing, dynamic when creating) */}
              <div>
                <label className="block text-xs font-bold text-neutral-455 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Custom Route Slug (ID) *
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingArticle}
                  placeholder="e.g. mobile-banking-design-2026"
                  value={formId}
                  onChange={(e) => setFormId(e.target.value.toLowerCase().replace(/[^a-z0-9\-]+/g, ""))}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 disabled:bg-neutral-100 dark:disabled:bg-neutral-950 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-850 dark:text-neutral-100 font-mono disabled:text-neutral-400"
                />
                {!editingArticle && (
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    URL structure: /article/{"{"}slug{"}"} (Only lowercase letters, numbers, and hyphens)
                  </span>
                )}
              </div>

              {/* Category & Layout parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-455 dark:text-neutral-400 uppercase tracking-wider mb-2">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-850 dark:text-neutral-100"
                  >
                    <option value="Tech">Tech</option>
                    <option value="How to">How to</option>
                    <option value="Case study">Case study</option>
                    <option value="Awards">Awards</option>
                    <option value="Case">Case</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-455 dark:text-neutral-400 uppercase tracking-wider mb-2">
                    Hero Image URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://images.unsplash.com/photo..."
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-850 dark:text-neutral-100"
                  />
                </div>
              </div>

              {/* Toggles parameters */}
              <div className="border-[0.5px] border-neutral-200 dark:border-neutral-800 p-4 rounded-xl space-y-3 bg-neutral-50/50 dark:bg-neutral-900/10">
                <span className="block text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider mb-2">
                  Display Options & Layout Roles
                </span>
                
                <div className="flex items-center justify-between">
                  <div className="pr-4">
                    <span className="text-xs font-bold text-neutral-850 dark:text-neutral-100 block">Featured Header</span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">Highlight this article inside the main homepage hero banner.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="w-4 h-4 text-accent-purple border-neutral-300 rounded focus:ring-accent-purple cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t-[0.5px] border-neutral-200 dark:border-neutral-800">
                  <div className="pr-4">
                    <span className="text-xs font-bold text-neutral-855 dark:text-neutral-100 block">Trending List</span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">Display in the right sidebar's trending news feed.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formTrending}
                    onChange={(e) => setFormTrending(e.target.checked)}
                    className="w-4 h-4 text-accent-purple border-neutral-300 rounded focus:ring-accent-purple cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3 border-t-[0.5px] border-neutral-200 dark:border-neutral-800">
                  <div className="pr-4">
                    <span className="text-xs font-bold text-neutral-855 dark:text-neutral-100 block">Partner Article</span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">Label this article as sponsored partner press content.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formIsPartner}
                    onChange={(e) => setFormIsPartner(e.target.checked)}
                    className="w-4 h-4 text-accent-purple border-neutral-300 rounded focus:ring-accent-purple cursor-pointer"
                  />
                </div>
              </div>

              {/* Video elements (Optional VideoJS stream source) */}
              <div className="border-[0.5px] border-neutral-200 dark:border-neutral-800 p-4 rounded-xl space-y-4 bg-neutral-50/50 dark:bg-neutral-900/10">
                <span className="block text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-video text-accent-purple"></i>
                  <span>Video Settings (Video.js Stream Player)</span>
                </span>
                
                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 mb-1">Video Stream URL</label>
                  <input
                    type="text"
                    placeholder="e.g. https://stream.mux.com/YOUR_STREAM_KEY/highest.mp4 or HLS (.m3u8)"
                    value={formVideoSrc}
                    onChange={(e) => setFormVideoSrc(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none text-neutral-800 dark:text-neutral-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-neutral-500 mb-1">Video Poster Image URL</label>
                  <input
                    type="text"
                    placeholder="https://image.mux.com/YOUR_STREAM_KEY/thumbnail.webp"
                    value={formVideoPoster}
                    onChange={(e) => setFormVideoPoster(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none text-neutral-800 dark:text-neutral-200"
                  />
                </div>
              </div>

              {/* Summary Text Area */}
              <div>
                <label className="block text-xs font-bold text-neutral-455 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Article Summary / Excerpt *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Write a brief editorial hook that summarises the core story outline..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-850 dark:text-neutral-100 resize-y"
                ></textarea>
              </div>

              {/* Article content (paragraphs) textarea */}
              <div>
                <label className="block text-xs font-bold text-neutral-455 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Body Content (Paragraphs) *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="Enter the main body of the article here. Use a blank line (double enter) to separate paragraphs."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-850 dark:text-neutral-100 font-sans resize-y leading-relaxed"
                ></textarea>
                <span className="text-[10px] text-neutral-400 mt-1 block">
                  Paragraph count: {formContent.split(/\n\n+/).filter(p => p.trim().length > 0).length}
                </span>
              </div>

              {/* Author Configuration - Admin Only */}
              {currentUser?.role === "super_admin" && (
                <div className="border-[0.5px] border-neutral-200 dark:border-neutral-800 p-4 rounded-xl space-y-4 bg-neutral-50/50 dark:bg-neutral-900/10">
                  <span className="block text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">
                    Author Metadata (Super Admin Override)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 mb-1">Author Name</label>
                      <input
                        type="text"
                        value={formAuthorName}
                        onChange={(e) => setFormAuthorName(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none text-neutral-850 dark:text-neutral-150"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 mb-1">Author Role/Bio</label>
                      <input
                        type="text"
                        value={formAuthorRole}
                        onChange={(e) => setFormAuthorRole(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none text-neutral-855 dark:text-neutral-150"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-500 mb-1">Author Avatar URL</label>
                    <input
                      type="text"
                      value={formAuthorAvatar}
                      onChange={(e) => setFormAuthorAvatar(e.target.value)}
                      className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none text-neutral-850 dark:text-neutral-200"
                    />
                  </div>
                </div>
              )}

              {/* Drawer footer buttons */}
              <div className="pt-4 flex justify-end gap-3 border-t-[0.5px] border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-5 py-2.5 rounded-full border-[0.5px] border-neutral-200 dark:border-neutral-855 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-400 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-full bg-neutral-900 hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  {editingArticle ? "Save Changes" : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default CrmDashboard;
