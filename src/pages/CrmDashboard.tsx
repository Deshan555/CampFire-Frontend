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
  fetchCategories,
  fetchSubcategories,
  type ReviewRule
} from "../api";
import { ArticleStatus, type Article } from "../data/articles";

import { AdminHeader } from "../components/admin/AdminHeader";
import CrmTabs from "../components/dashboard/CrmTabs";
import CrmTable from "../components/dashboard/CrmTable";
import { Pagination } from "../components/common/Pagination";
import { Newspaper, Plus, ShieldAlert } from "lucide-react";
import AiRulesModal from "../components/dashboard/AiRulesModal";
import AiReviewModal from "../components/dashboard/AiReviewModal";
import ArticleFormDrawer from "../components/dashboard/ArticleFormDrawer";
import { siteConfig } from "../config/site";

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
  const [isSaving, setIsSaving] = useState(false);

  const [formId, setFormId] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formSummary, setFormSummary] = useState("");
  const [formCategory, setFormCategory] = useState("Tech");
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [subcategoriesList, setSubcategoriesList] = useState<any[]>([]);
  const [formSubcategory, setFormSubcategory] = useState("");
  const [formHashtags, setFormHashtags] = useState<string[]>([]);
  const [formTargetCountries, setFormTargetCountries] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<ArticleStatus>(ArticleStatus.APPROVED);
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
  const BLOG_SITE_ID = siteConfig.blogSiteId;

  const [formAuthorName, setFormAuthorName] = useState("Editorial Board");
  const [formAuthorRole, setFormAuthorRole] = useState("Senior Editor");
  const [formAuthorAvatar, setFormAuthorAvatar] = useState("");

  const [aiExpanded, setAiExpanded] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("Professional & Analytical");
  const [aiInstructions, setAiInstructions] = useState("");
  const [aiIncludeVideo, setAiIncludeVideo] = useState(true);
  const [aiError, setAiError] = useState("");
  const [aiSuccess, setAiSuccess] = useState("");
  const [aiTargetCountries, setAiTargetCountries] = useState<string[]>([]);
  const [aiImagePrompts, setAiImagePrompts] = useState<string[]>([]);

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
      const finalInstructions = aiInstructions.trim() + (aiTargetCountries.length > 0 ? `\nTarget Countries: ${aiTargetCountries.join(", ")}` : "");
      
      const result = await generateAiArticle({
        model: "gemma3:1b",
        topic: aiTopic.trim(),
        tone: aiTone,
        instructions: finalInstructions,
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
      
      if (result.category) setFormCategory(result.category);
      if (result.subcategory) setFormSubcategory(result.subcategory);
      if (result.hashtags && result.hashtags.length > 0) setFormHashtags(result.hashtags);
      if (result.targetCountries && result.targetCountries.length > 0) setFormTargetCountries(result.targetCountries);
      if (result.imagePrompts && result.imagePrompts.length > 0) setAiImagePrompts(result.imagePrompts);

      if (result.video) {
        setFormVideoSrc(result.video.src || "");
        setFormVideoPoster(result.video.poster || "");
        if (result.video.poster) {
          setFormImage(result.video.poster);
        }
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
      authorId: user.id
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

      // Load taxonomy lists dynamically
      fetchCategories()
        .then((data: any[]) => setCategoriesList(data))
        .catch((err: any) => console.error("Failed to load categories:", err));
      fetchSubcategories()
        .then((data: any[]) => setSubcategoriesList(data))
        .catch((err: any) => console.error("Failed to load subcategories:", err));

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
    setFormSubcategory("");
    setFormHashtags([]);
    setFormTargetCountries([]);
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
    setFormAuthorAvatar(currentUser?.avatar || "");

    setAiExpanded(false);
    setAiTopic("");
    setAiTone("Professional & Analytical");
    setAiInstructions("");
    setAiError("");
    setAiSuccess("");
    setAiGenerating(false);
    setAiImagePrompts([]);

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

  const handleRunAiReview = async (
    selectedRuleIds: string[],
    addedRules: { name: string; criteria: string }[]
  ) => {
    if (!reviewArticleId) return;
    setIsReviewing(true);
    setReviewResult(null);
    try {
      const res = await reviewArticleWithAi(reviewArticleId, reviewModel, selectedRuleIds, addedRules);
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
    setFormSubcategory(art.subcategory || "");
    setFormHashtags(art.hashtags || []);
    setFormTargetCountries(art.targetCountries || []);
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
    setFormAuthorAvatar(art.author?.avatar || "");

    setAiExpanded(false);
    setAiTopic("");
    setAiTone("Professional & Analytical");
    setAiInstructions("");
    setAiError("");
    setAiSuccess("");
    setAiGenerating(false);
    setAiImagePrompts([]);

    setErrorMsg("");
    setIsDrawerOpen(true);
  };

  const handleApprove = async (id: string) => {
    if (!currentUser || currentUser.role !== "SUPER_ADMIN") return;
    try {
      await approveArticle(id);
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
      await rejectArticle(id, reason);
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
    if (!formCategory || !formCategory.trim()) {
      setErrorMsg("Category is required.");
      return;
    }
    if (!formSubcategory || !formSubcategory.trim()) {
      setErrorMsg("Subcategory is required.");
      return;
    }
    if (!formHashtags || formHashtags.length === 0) {
      setErrorMsg("At least one hashtag is required.");
      return;
    }
    if (!formTargetCountries || formTargetCountries.length === 0) {
      setErrorMsg("At least one target country is required.");
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
      subcategory: formSubcategory,
      hashtags: formHashtags,
      targetCountries: formTargetCountries,
      image: formImage.trim() || undefined,
      imageUrls: formImageUrls,
      video: videoObj,
      featured: formFeatured,
      trending: editingArticle ? editingArticle.trending : false,
      isPartner: editingArticle ? editingArticle.isPartner : false,
      authorId: currentUser.id,
      role: currentUser.role,
      status: editingArticle?.status
    };

    setIsSaving(true);
    try {
      if (editingArticle) {
        await updateArticle(editingArticle.id, payload);
        triggerSuccess(`Article "${formTitle}" updated successfully.`);
      } else {
        const exists = articles.some((a) => a.id === payload.id);
        if (exists) {
          setErrorMsg(`An article with slug ID "${payload.id}" already exists. Please choose a different slug.`);
          setIsSaving(false);
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
    } finally {
      setIsSaving(false);
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
  return (
    <div className="w-full h-full flex flex-col bg-white overflow-y-auto">
      <AdminHeader
        title="Editorial Dashboard"
        icon={Newspaper}
        badge={`${totalArticles} total`}
      >
        <div className="flex items-center gap-2">
          {currentUser?.role === 'super_admin' && (
            <button onClick={handleOpenRules} className="secondary-button">
               <ShieldAlert size={14} className="mr-1 inline-block" /> AI Rules
            </button>
          )}
          <button onClick={handleOpenCreate} className="main-button">
            <Plus size={14} className="mr-1 inline-block" /> Write Article
          </button>
        </div>
      </AdminHeader>

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

      <div className="bg-white dark:bg-brand-dark border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden animate-fade-in">
        <CrmTabs
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setCurrentPage={setCurrentPage}
          articles={articles}
        />
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

        <div className="p-4 border-t border-gray-200">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <ArticleFormDrawer
        isSaving={isSaving}
        aiIncludeVideo={aiIncludeVideo}
        setAiIncludeVideo={setAiIncludeVideo}
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
        categoriesList={categoriesList}
        subcategoriesList={subcategoriesList}
        formSubcategory={formSubcategory}
        setFormSubcategory={setFormSubcategory}
        formHashtags={formHashtags}
        setFormHashtags={setFormHashtags}
        formTargetCountries={formTargetCountries}
        setFormTargetCountries={setFormTargetCountries}
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
        aiImagePrompts={aiImagePrompts}
        aiTargetCountries={aiTargetCountries}
        setAiTargetCountries={setAiTargetCountries}
        handleRunAiWriter={handleRunAiWriter}
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
        rules={rules}
      />
    </div>
  );
};

export default CrmDashboard;
