/**
 * Author: Deshan Jayashanka
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  approveArticle,
  rejectArticle,
  generateAiArticle,
  uploadFile,
  fetchRules,
  createRule,
  updateRule,
  deleteRule,
  reviewArticleWithAi,
  type ReviewRule
} from "../api";
import type { Article } from "../data/articles";

import CrmHeader from "../components/dashboard/CrmHeader";
import CrmAnalytics from "../components/dashboard/CrmAnalytics";
import CrmTabs from "../components/dashboard/CrmTabs";
import CrmTable from "../components/dashboard/CrmTable";
import CrmPagination from "../components/dashboard/CrmPagination";
import AiRulesModal from "../components/dashboard/AiRulesModal";
import AiReviewModal from "../components/dashboard/AiReviewModal";
import ArticleFormDrawer from "../components/dashboard/ArticleFormDrawer";

export const CrmDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);

  const [formId, setFormId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formCategory, setFormCategory] = useState("Tech");
  const [activeTab, setActiveTab] = useState<'approved' | 'pending' | 'rejected'>('approved');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [formImage, setFormImage] = useState("");
  const [formImageUrls, setFormImageUrls] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [formVideoSrc, setFormVideoSrc] = useState("");
  const [formVideoPoster, setFormVideoPoster] = useState("");
  const [formContent, setFormContent] = useState("");

  const [formFeatured, setFormFeatured] = useState(false);
  const [formTrending, setFormTrending] = useState(false);
  const [formIsPartner, setFormIsPartner] = useState(false);

  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [rules, setRules] = useState<ReviewRule[]>([]);
  const [isRulesLoading, setIsRulesLoading] = useState(false);
  const [editingRule, setEditingRule] = useState<ReviewRule | null>(null);
  const [ruleFormName, setRuleFormName] = useState("");
  const [ruleFormCriteria, setRuleFormCriteria] = useState("");
  const [ruleFormActive, setRuleFormActive] = useState(true);

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewArticleId, setReviewArticleId] = useState<string | null>(null);
  const [reviewArticleTitle, setReviewArticleTitle] = useState("");
  const [reviewModel, setReviewModel] = useState("gemma3:1b");
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewResult, setReviewResult] = useState<{ approved: boolean; feedback: string } | null>(null);
  const BLOG_SITE_ID = "11111111-1111-1111-1111-111111111111";

  const [formAuthorName, setFormAuthorName] = useState("Editorial Board");
  const [formAuthorRole, setFormAuthorRole] = useState("Senior Editor");
  const [formAuthorAvatar, setFormAuthorAvatar] = useState(
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
  );

  const [aiExpanded, setAiExpanded] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("Professional & Analytical");
  const [aiInstructions, setAiInstructions] = useState("");
  const [aiIncludeVideo, setAiIncludeVideo] = useState(true);
  const [aiError, setAiError] = useState("");
  const [aiSuccess, setAiSuccess] = useState("");

  const triggerSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const handleRunAiWriter = async () => {
    if (!aiTopic.trim()) {
      setAiError("Please enter a topic description first.");
      return;
    }
    setAiGenerating(true);
    setAiError("");
    setAiSuccess("");
    try {
      const result = await generateAiArticle({
        model: "gemma3:1b",
        topic: aiTopic.trim(),
        tone: aiTone,
        instructions: aiInstructions.trim(),
        includeVideo: aiIncludeVideo
      });

      setFormTitle(result.title);
      if (!editingArticle) {
        const generatedSlug = result.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        setFormId(generatedSlug);
      }
      setFormSummary(result.summary);
      setFormContent(result.content.join("\n\n"));
      
      if (result.video) {
        setFormVideoSrc(result.video.src || "");
        setFormVideoPoster(result.video.poster || "");
      } else {
        setFormVideoSrc("");
        setFormVideoPoster("");
      }
      
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
        console.error(err);
        setErrorMsg("Failed to fetch articles. Please ensure the backend is running.");
        setLoading(false);
      });
  };

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
      if (user.role === "SUPER_ADMIN" || user.role === "EDITOR") {
        fetchRules(BLOG_SITE_ID)
          .then((data) => setRules(data))
          .catch((err) => console.error("Failed to prefetch rules:", err));
      }
    } catch (e) {
      localStorage.removeItem("editorUser");
      localStorage.removeItem("authToken");
      window.dispatchEvent(new Event("storage"));
      navigate("/login");
    }
  }, [navigate]);

  const handleOpenCreate = () => {
    setEditingArticle(null);
    setFormId("");
    setFormTitle("");
    setFormSummary("");
    setFormCategory("Tech");
    setFormImage("");
    setFormImageUrls([]);
    setFormVideoSrc("");
    setFormVideoPoster("");
    setFormContent("");
    setFormFeatured(false);
    setFormTrending(false);
    setFormIsPartner(false);
    
    setFormAuthorName(currentUser?.name || "Editorial Board");
    setFormAuthorRole(
      currentUser?.role === "SUPER_ADMIN"
        ? "Editor-in-Chief"
        : currentUser?.role === "EDITOR"
        ? "Associate Editor"
        : "Contributing Writer"
    );
    setFormAuthorAvatar(
      currentUser?.avatar ||
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80"
    );

    setAiExpanded(false);
    setAiTopic("");
    setAiTone("Professional & Analytical");
    setAiInstructions("");
    setAiError("");
    setAiSuccess("");
    setAiGenerating(false);

    setErrorMsg("");
    setIsDrawerOpen(true);
  };

  const loadRules = async () => {
    setIsRulesLoading(true);
    try {
      const data = await fetchRules(BLOG_SITE_ID);
      setRules(data);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to load AI review rules: ${err.message}`);
    } finally {
      setIsRulesLoading(false);
    }
  };

  const handleOpenRules = () => {
    setIsRulesModalOpen(true);
    setEditingRule(null);
    setRuleFormName("");
    setRuleFormCriteria("");
    setRuleFormActive(true);
    loadRules();
  };

  const handleSaveRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleFormName.trim() || !ruleFormCriteria.trim()) {
      setErrorMsg("Rule Name and Criteria are required.");
      return;
    }
    try {
      if (editingRule && editingRule.id) {
        await updateRule(editingRule.id, {
          name: ruleFormName.trim(),
          criteria: ruleFormCriteria.trim(),
          isActive: ruleFormActive
        });
        triggerSuccess(`Rule "${ruleFormName}" updated successfully.`);
      } else {
        await createRule({
          blogSiteId: BLOG_SITE_ID,
          name: ruleFormName.trim(),
          criteria: ruleFormCriteria.trim(),
          isActive: ruleFormActive
        });
        triggerSuccess(`Rule "${ruleFormName}" created successfully.`);
      }
      setEditingRule(null);
      setRuleFormName("");
      setRuleFormCriteria("");
      setRuleFormActive(true);
      loadRules();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to save AI rule: ${err.message}`);
    }
  };

  const handleEditRule = (rule: ReviewRule) => {
    setEditingRule(rule);
    setRuleFormName(rule.name);
    setRuleFormCriteria(rule.criteria);
    setRuleFormActive(rule.is_active);
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this AI review rule?")) return;
    try {
      await deleteRule(id);
      triggerSuccess("AI Review rule deleted successfully.");
      loadRules();
      if (editingRule?.id === id) {
        setEditingRule(null);
        setRuleFormName("");
        setRuleFormCriteria("");
        setRuleFormActive(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Failed to delete AI rule: ${err.message}`);
    }
  };

  const handleOpenReview = (art: Article) => {
    setReviewArticleId(art.id);
    setReviewArticleTitle(art.title);
    setReviewResult(null);
    setIsReviewing(false);
    setIsReviewModalOpen(true);
  };

  const handleRunAiReview = async () => {
    if (!reviewArticleId) return;
    setIsReviewing(true);
    setReviewResult(null);
    try {
      const res = await reviewArticleWithAi(reviewArticleId, reviewModel);
      setReviewResult({
        approved: res.approved,
        feedback: res.feedback
      });
      loadArticles(currentUser);
      triggerSuccess(res.approved ? "AI Approved and Published!" : "AI Reviewed: Content Rejected");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`AI review failed: ${err.message}`);
    } finally {
      setIsReviewing(false);
    }
  };

  const handleOpenEdit = (art: Article) => {
    setEditingArticle(art);
    setFormId(art.id);
    setFormTitle(art.title);
    setFormSummary(art.summary);
    setFormCategory(art.category);
    setFormImage(art.image || "");
    setFormImageUrls(art.imageUrls || []);
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

    setAiExpanded(false);
    setAiTopic("");
    setAiTone("Professional & Analytical");
    setAiInstructions("");
    setAiError("");
    setAiSuccess("");
    setAiGenerating(false);

    setErrorMsg("");
    setIsDrawerOpen(true);
  };

  const handleApprove = async (id: string) => {
    if (!currentUser || currentUser.role !== "SUPER_ADMIN") return;
    try {
      await approveArticle(id, currentUser.role);
      triggerSuccess("Article approved and published successfully.");
      loadArticles(currentUser);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to approve article: " + err.message);
    }
  };

  const handleReject = async (id: string) => {
    if (!currentUser || (currentUser.role !== "SUPER_ADMIN" && currentUser.role !== "EDITOR")) return;
    const reason = window.prompt("Enter a reason/feedback for declining this article:", "Content did not meet editorial guidelines.");
    if (reason === null) return;
    try {
      await rejectArticle(id, currentUser.role, reason);
      triggerSuccess("Article successfully declined and moved to Declined tab.");
      loadArticles(currentUser);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to reject article: " + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this publication?")) return;
    try {
      await deleteArticle(id);
      triggerSuccess("Article deleted successfully.");
      loadArticles(currentUser);
    } catch (err: any) {
      console.error(err);
      setErrorMsg("Failed to delete article: " + err.message);
    }
  };

  const handleUploadHeroImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setErrorMsg("");
    try {
      const res = await uploadFile(file);
      if (res.success) {
        setFormImage(res.url);
        triggerSuccess("Hero cover image uploaded successfully.");
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Cover image upload failed: ${err.message}`);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleUploadGalleryImages = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingGallery(true);
    setErrorMsg("");
    try {
      const uploadPromises = Array.from(files).map((file) => uploadFile(file));
      const results = await Promise.all(uploadPromises);
      const successfulUrls = results.filter((r) => r.success).map((r) => r.url);
      if (successfulUrls.length > 0) {
        setFormImageUrls((prev) => [...prev, ...successfulUrls]);
        triggerSuccess(`Successfully uploaded ${successfulUrls.length} gallery images.`);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(`Gallery upload failed: ${err.message}`);
    } finally {
      setIsUploadingGallery(false);
    }
  };

  const handleRemoveGalleryImage = (urlToRemove: string) => {
    setFormImageUrls((prev) => prev.filter((url) => url !== urlToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

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
      id: formId.trim() || undefined,
      title: formTitle.trim(),
      summary: formSummary.trim(),
      content: contentParagraphs,
      category: formCategory,
      image: formImage.trim() || undefined,
      imageUrls: formImageUrls,
      video: videoObj,
      featured: formFeatured,
      trending: formTrending,
      isPartner: formIsPartner,
      authorName: formAuthorName.trim(),
      authorRole: formAuthorRole.trim(),
      authorAvatar: formAuthorAvatar.trim(),
      role: currentUser.role,
      status: editingArticle ? editingArticle.status : (currentUser.role === "SUPER_ADMIN" ? "approved" : "pending")
    };

    try {
      if (editingArticle) {
        await updateArticle(editingArticle.id, payload);
        triggerSuccess(`Article "${formTitle}" updated successfully.`);
      } else {
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

  const filteredArticles = articles.filter((art) => {
    return art.status === activeTab;
  });

  const sortedArticles = [...filteredArticles].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  const paginatedArticles = sortedArticles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const totalPages = Math.ceil(sortedArticles.length / pageSize);
  const totalArticles = filteredArticles.length;
  const totalLikes = filteredArticles.reduce((sum, a) => sum + (a.likes || 0), 0);

  return (
    <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-8 border-x-[0.5px] border-neutral-200 dark:border-neutral-800 transition-colors duration-300">
      <CrmHeader
        currentUser={currentUser}
        handleOpenRules={handleOpenRules}
        handleOpenCreate={handleOpenCreate}
      />

      {errorMsg && (
        <div className="mb-6 bg-red-50 dark:bg-red-955/20 border-[0.5px] border-red-200 dark:border-red-900 text-red-750 dark:text-red-400 text-xs font-bold py-3 px-4 rounded-xl flex items-center gap-2 animate-fade-in">
          <i className="fa-solid fa-triangle-exclamation text-sm"></i>
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 bg-emerald-50 dark:bg-emerald-950/20 border-[0.5px] border-emerald-200 dark:border-emerald-800 text-emerald-850 dark:text-emerald-400 text-xs font-bold py-3 px-4 rounded-xl flex items-center gap-2 animate-fade-in">
          <i className="fa-solid fa-circle-check text-sm"></i>
          <span>{successMsg}</span>
        </div>
      )}

      <CrmAnalytics
        currentUser={currentUser}
        loading={loading}
        totalArticles={totalArticles}
        totalLikes={totalLikes}
        rulesCount={rules.length}
        activeRulesCount={rules.filter(r => r.is_active).length}
        activeModel={reviewModel}
        handleOpenRules={handleOpenRules}
      />

      <CrmTabs
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setCurrentPage={setCurrentPage}
        articles={articles}
      />

      <div className="bg-white dark:bg-brand-dark border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden animate-fade-in">
        <CrmTable
          currentUser={currentUser}
          loading={loading}
          sortedArticles={sortedArticles}
          paginatedArticles={paginatedArticles}
          handleOpenReview={handleOpenReview}
          handleApprove={handleApprove}
          handleReject={handleReject}
          handleOpenEdit={handleOpenEdit}
          handleDelete={handleDelete}
          handleOpenCreate={handleOpenCreate}
        />

        <CrmPagination
          sortedArticles={sortedArticles}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          pageSize={pageSize}
          totalPages={totalPages}
        />
      </div>

      <ArticleFormDrawer
        isDrawerOpen={isDrawerOpen}
        setIsDrawerOpen={setIsDrawerOpen}
        editingArticle={editingArticle}
        formId={formId}
        setFormId={setFormId}
        formTitle={formTitle}
        setFormTitle={setFormTitle}
        formSummary={formSummary}
        setFormSummary={setFormSummary}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        formImage={formImage}
        setFormImage={setFormImage}
        formImageUrls={formImageUrls}
        setFormImageUrls={setFormImageUrls}
        isUploadingImage={isUploadingImage}
        isUploadingGallery={isUploadingGallery}
        formVideoSrc={formVideoSrc}
        setFormVideoSrc={setFormVideoSrc}
        formVideoPoster={formVideoPoster}
        setFormVideoPoster={setFormVideoPoster}
        formContent={formContent}
        setFormContent={setFormContent}
        formFeatured={formFeatured}
        setFormFeatured={setFormFeatured}
        formTrending={formTrending}
        setFormTrending={setFormTrending}
        formIsPartner={formIsPartner}
        setFormIsPartner={setFormIsPartner}
        formAuthorName={formAuthorName}
        setFormAuthorName={setFormAuthorName}
        formAuthorRole={formAuthorRole}
        setFormAuthorRole={setFormAuthorRole}
        formAuthorAvatar={formAuthorAvatar}
        setFormAuthorAvatar={setFormAuthorAvatar}
        currentUser={currentUser}
        showPreview={showPreview}
        setShowPreview={setShowPreview}
        handleUploadHeroImage={handleUploadHeroImage}
        handleUploadGalleryImages={handleUploadGalleryImages}
        handleRemoveGalleryImage={handleRemoveGalleryImage}
        handleSave={handleSave}
        aiExpanded={aiExpanded}
        setAiExpanded={setAiExpanded}
        aiGenerating={aiGenerating}
        aiTopic={aiTopic}
        setAiTopic={setAiTopic}
        aiTone={aiTone}
        setAiTone={setAiTone}
        aiInstructions={aiInstructions}
        setAiInstructions={setAiInstructions}
        aiError={aiError}
        aiSuccess={aiSuccess}
        handleRunAiWriter={handleRunAiWriter}
        aiIncludeVideo={aiIncludeVideo}
        setAiIncludeVideo={setAiIncludeVideo}
      />

      <AiRulesModal
        isRulesModalOpen={isRulesModalOpen}
        setIsRulesModalOpen={setIsRulesModalOpen}
        isRulesLoading={isRulesLoading}
        rules={rules}
        editingRule={editingRule}
        ruleFormName={ruleFormName}
        setRuleFormName={setRuleFormName}
        ruleFormCriteria={ruleFormCriteria}
        setRuleFormCriteria={setRuleFormCriteria}
        ruleFormActive={ruleFormActive}
        setRuleFormActive={setRuleFormActive}
        handleSaveRule={handleSaveRule}
        handleEditRule={handleEditRule}
        handleDeleteRule={handleDeleteRule}
        setEditingRule={setEditingRule}
      />

      <AiReviewModal
        isReviewModalOpen={isReviewModalOpen}
        setIsReviewModalOpen={setIsReviewModalOpen}
        isReviewing={isReviewing}
        reviewArticleTitle={reviewArticleTitle}
        reviewModel={reviewModel}
        setReviewModel={setReviewModel}
        handleRunAiReview={handleRunAiReview}
        reviewResult={reviewResult}
        setReviewResult={setReviewResult}
        reviewArticleId={reviewArticleId}
        articles={articles}
        handleOpenEdit={handleOpenEdit}
      />
    </div>
  );
};

export default CrmDashboard;
