import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchArticles, createArticle, updateArticle, deleteArticle, approveArticle, rejectArticle, generateAiArticle } from "../api";
import type { Article } from "../data/articles";
import Markdown from "../components/Markdown";

export const CrmDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Drawer UI state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
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

  // AI Assistant form states
  const [aiExpanded, setAiExpanded] = useState(false);
  const [aiModel, setAiModel] = useState("gemma3:1b");
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("Professional");
  const [aiInstructions, setAiInstructions] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [aiSuccess, setAiSuccess] = useState("");

  const handleAiGenerate = async () => {
    if (!aiTopic.trim()) {
      setAiError("Please specify a topic for the article.");
      return;
    }
    setAiError("");
    setAiSuccess("");
    setAiGenerating(true);

    try {
      const result = await generateAiArticle({
        model: aiModel,
        topic: aiTopic.trim(),
        tone: aiTone,
        instructions: aiInstructions.trim()
      });

      // Populate form fields
      setFormTitle(result.title);
      // Auto-generate a slug from title if not set
      if (!editingArticle) {
        const generatedSlug = result.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        setFormId(generatedSlug);
      }
      setFormSummary(result.summary);
      setFormContent(result.content.join("\n\n"));
      
      setAiSuccess("Article generated successfully and populated into the form!");
      setTimeout(() => {
        setAiExpanded(false);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Failed to generate AI article.");
    } finally {
      setAiGenerating(false);
    }
  };

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
    
    // Reset AI Assistant states
    setAiExpanded(false);
    setAiTopic("");
    setAiInstructions("");
    setAiError("");
    setAiSuccess("");
    setAiGenerating(false);

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

    // Reset AI Assistant states
    setAiExpanded(false);
    setAiTopic("");
    setAiInstructions("");
    setAiError("");
    setAiSuccess("");
    setAiGenerating(false);

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
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
        <div className="fixed inset-0 z-50 bg-white dark:bg-brand-dark flex flex-col animate-fade-in overflow-hidden">
          {/* Fullscreen Editor Header */}
          <div className="h-16 shrink-0 border-b-[0.5px] border-neutral-200 dark:border-neutral-850 px-6 bg-neutral-50 dark:bg-neutral-900/30 flex items-center justify-between z-10 transition-colors duration-300">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors cursor-pointer"
              >
                <i className="fa-solid fa-arrow-left"></i>
                <span>Dashboard</span>
              </button>
              <span className="text-neutral-300 dark:text-neutral-700 font-normal">|</span>
              <h2 className="font-serif text-base font-black text-neutral-900 dark:text-neutral-50">
                {editingArticle ? "Modify Publication" : "Compose Editorial"}
              </h2>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 border-[0.5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-150 dark:hover:bg-neutral-800 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <i className={`fa-solid ${showPreview ? "fa-eye-slash" : "fa-eye"}`}></i>
                <span>{showPreview ? "Hide Preview" : "Show Preview"}</span>
              </button>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="px-4 py-2 border-[0.5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-150 dark:hover:bg-neutral-800 rounded-lg text-xs font-semibold text-neutral-600 dark:text-neutral-400 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="px-5 py-2 bg-neutral-900 hover:bg-neutral-850 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
              >
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <span>{editingArticle ? "Save Changes" : "Publish Article"}</span>
              </button>
            </div>
          </div>

          {/* Splitscreen Workspace */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left Side: Editor Form (Scrollable) */}
            <form
              onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}
              className={`${
                showPreview ? "w-1/2 border-r-[0.5px]" : "w-full border-r-0"
              } border-neutral-200 dark:border-neutral-850 bg-neutral-50/20 dark:bg-neutral-900/5 overflow-y-auto p-6 space-y-6 text-left transition-all duration-300`}
            >
              {/* Form Validation Error */}
              {errorMsg && (
                <div className="bg-red-50 dark:bg-red-950/20 border-[0.5px] border-red-200 dark:border-red-950 text-red-750 dark:text-red-400 text-xs font-bold py-3 px-4 rounded-xl flex items-center gap-2 animate-fade-in">
                  <i className="fa-solid fa-circle-exclamation text-sm"></i>
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* AI Writing Assistant Section */}
              <div className="border-[0.5px] border-violet-200 dark:border-violet-850 rounded-xl bg-violet-50/10 dark:bg-violet-950/5 p-4 space-y-3">
                <button
                  type="button"
                  onClick={() => setAiExpanded(!aiExpanded)}
                  className="w-full flex items-center justify-between text-xs font-bold text-violet-650 dark:text-violet-450 uppercase tracking-wider focus:outline-none cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-wand-magic-sparkles text-violet-500 animate-pulse"></i>
                    <span>AI Writing Assistant</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] bg-violet-100 dark:bg-violet-900/40 text-violet-750 dark:text-violet-300 px-2 py-0.5 rounded-full font-semibold normal-case">
                      Ollama
                    </span>
                    <i className={`fa-solid fa-chevron-${aiExpanded ? "up" : "down"}`}></i>
                  </div>
                </button>

                {aiExpanded && (
                  <div className="pt-3 border-t-[0.5px] border-violet-100 dark:border-violet-900/50 space-y-3">
                    {aiError && (
                      <div className="bg-red-50 dark:bg-red-950/20 border-[0.5px] border-red-200 dark:border-red-950 text-red-750 dark:text-red-400 text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1.5">
                        <i className="fa-solid fa-circle-exclamation"></i>
                        <span>{aiError}</span>
                      </div>
                    )}
                    {aiSuccess && (
                      <div className="bg-emerald-50 dark:bg-emerald-950/20 border-[0.5px] border-emerald-250 dark:border-emerald-950 text-emerald-750 dark:text-emerald-455 text-[11px] py-1.5 px-3 rounded-lg flex items-center gap-1.5 font-bold">
                        <i className="fa-solid fa-circle-check"></i>
                        <span>{aiSuccess}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-neutral-455 dark:text-neutral-500 tracking-wider mb-1">
                          Select Ollama Model
                        </label>
                        <select
                          value={aiModel}
                          onChange={(e) => setAiModel(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-800 dark:text-neutral-200"
                        >
                          <option value="gemma3:1b">Gemma 3 1B</option>
                          <option value="deepseek-r1:1.5b">DeepSeek R1 1.5B</option>
                          <option value="deepseek-r1:8b">DeepSeek R1 8B</option>
                          <option value="llama3.2:latest">Llama 3.2 3B</option>
                          <option value="deepseek-coder:1.3b">DeepSeek Coder 1.3B</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-extrabold uppercase text-neutral-455 dark:text-neutral-500 tracking-wider mb-1">
                          Article Tone
                        </label>
                        <select
                          value={aiTone}
                          onChange={(e) => setAiTone(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-800 dark:text-neutral-200"
                        >
                          <option value="Professional">Professional</option>
                          <option value="Casual">Casual</option>
                          <option value="Inspirational">Inspirational</option>
                          <option value="Technical">Technical</option>
                          <option value="Informative">Informative</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-neutral-455 dark:text-neutral-500 tracking-wider mb-1">
                        Topic or Subject *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Next-gen grid system architecture using WebAssembly..."
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-800 dark:text-neutral-200"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-extrabold uppercase text-neutral-455 dark:text-neutral-500 tracking-wider mb-1">
                        Extra Instructions (Optional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Focus on memory safety. Keep it under 4 paragraphs."
                        value={aiInstructions}
                        onChange={(e) => setAiInstructions(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-800 dark:text-neutral-200 resize-none"
                      ></textarea>
                    </div>

                    <button
                      type="button"
                      disabled={aiGenerating}
                      onClick={handleAiGenerate}
                      className="w-full py-2 bg-violet-650 hover:bg-violet-750 disabled:bg-violet-400 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {aiGenerating ? (
                        <>
                          <i className="fa-solid fa-spinner animate-spin"></i>
                          <span>Generating Article...</span>
                        </>
                      ) : (
                        <>
                          <i className="fa-solid fa-wand-magic-sparkles"></i>
                          <span>Generate & Populate Form</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>

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
                    URL route structure: /article/{"{"}slug{"}"} (Only lowercase letters, numbers, and hyphens)
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
                <label className="block text-xs font-bold text-neutral-455 dark:text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Body Content (Markdown README format) *</span>
                  <span className="text-[10px] text-neutral-450 normal-case font-normal">
                    Double-newline separates paragraphs.
                  </span>
                </label>
                <textarea
                  required
                  rows={14}
                  placeholder="Write in Markdown. Support for headings (#), lists (-), bold (**), italic (*), code blocks (```) and blockquotes (>)."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-855 dark:text-neutral-100 resize-y font-mono"
                ></textarea>
                <div className="text-[10px] text-neutral-400 mt-1 flex justify-between">
                  <span>Paragraphs split count: {formContent.split(/\n\n+/).filter(p => p.trim().length > 0).length}</span>
                  <span>Markdown formatting active</span>
                </div>
              </div>

              {/* Super Admin Author Customization */}
              {currentUser?.role === "super_admin" && (
                <div className="border-[0.5px] border-neutral-200 dark:border-neutral-800 p-4 rounded-xl space-y-4 bg-neutral-50/50 dark:bg-neutral-900/10">
                  <span className="block text-[10px] font-extrabold uppercase text-neutral-405 tracking-wider flex items-center gap-1.5">
                    <i className="fa-solid fa-user-pen text-accent-purple"></i>
                    <span>Author Customization Override (Admin Only)</span>
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 mb-1">Author Name</label>
                      <input
                        type="text"
                        value={formAuthorName}
                        onChange={(e) => setFormAuthorName(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none text-neutral-850 dark:text-neutral-200"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-neutral-500 mb-1">Author Role/Bio</label>
                      <input
                        type="text"
                        value={formAuthorRole}
                        onChange={(e) => setFormAuthorRole(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none text-neutral-850 dark:text-neutral-200"
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
            </form>

            {/* Right Side: Live Markdown Preview (Scrollable) */}
            {showPreview && (
              <div className="w-1/2 bg-white dark:bg-brand-dark overflow-y-auto p-8 md:p-12 flex flex-col items-center">
                <div className="w-full max-w-xl text-left space-y-6">
                  <div className="flex items-center justify-between border-b-[0.5px] border-neutral-200 dark:border-neutral-850 pb-3 mb-2 select-none">
                    <span className="text-[9px] font-extrabold uppercase bg-neutral-100 dark:bg-neutral-850 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-md tracking-wider">
                      Live Markdown Preview
                    </span>
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-550 italic">
                      Camp Fire Publishing Layout
                    </span>
                  </div>
                  
                  {formImage && (
                    <div className="w-full aspect-[16/10] bg-neutral-100 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm">
                      <img
                        src={formImage}
                        alt="Cover Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <h1 className="font-serif text-3xl font-black text-neutral-950 dark:text-neutral-50 tracking-tight leading-tight">
                    {formTitle || "Untitled Draft"}
                  </h1>

                  <div className="flex items-center gap-3">
                    <img
                      src={formAuthorAvatar}
                      alt={formAuthorName}
                      className="w-8 h-8 rounded-full object-cover border-[0.5px] border-neutral-200 dark:border-neutral-800 shrink-0"
                    />
                    <div>
                      <p className="text-xs font-bold text-neutral-850 dark:text-neutral-100 leading-tight">
                        {formAuthorName}
                      </p>
                      <p className="text-[9px] text-neutral-400 dark:text-neutral-550 uppercase font-bold tracking-wider leading-none mt-0.5">
                        {formAuthorRole}
                      </p>
                    </div>
                  </div>
                  
                  {formSummary && (
                    <div className="bg-neutral-50 dark:bg-neutral-900/30 border-l-2 border-violet-500 p-4 rounded-r-xl">
                      <span className="block text-[9px] uppercase font-extrabold text-neutral-400 dark:text-neutral-550 mb-1 tracking-wider">
                        Summary Excerpt
                      </span>
                      <p className="font-serif italic text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
                        {formSummary}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t-[0.5px] border-neutral-100 dark:border-neutral-850">
                    {formContent ? (
                      <Markdown content={formContent} />
                    ) : (
                      <p className="text-xs italic text-neutral-400 dark:text-neutral-500">
                        Write body content in the markdown editor on the left pane to render the preview.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default CrmDashboard;
