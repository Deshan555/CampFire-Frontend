/**
 * Author: Deshan Jayashanka
 */

import React from "react";
import Markdown from "../Markdown";
import type { Article } from "../../data/articles";
import { ParticleGlobe, AnimatedButton, GlowingFluidOrb } from "../canves-animations";

interface ArticleFormDrawerProps {
  aiIncludeVideo: boolean;
  setAiIncludeVideo: (val: boolean) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (open: boolean) => void;
  editingArticle: Article | null;
  formId: string;
  setFormId: (id: string) => void;
  formTitle: string;
  setFormTitle: (title: string) => void;
  formSummary: string;
  setFormSummary: (summary: string) => void;
  formCategory: string;
  setFormCategory: (category: string) => void;
  formImage: string;
  setFormImage: (image: string) => void;
  formImageUrls: string[];
  setFormImageUrls: React.Dispatch<React.SetStateAction<string[]>>;
  isUploadingImage: boolean;
  isUploadingGallery: boolean;
  formVideoSrc: string;
  setFormVideoSrc: (src: string) => void;
  formVideoPoster: string;
  setFormVideoPoster: (poster: string) => void;
  formContent: string;
  setFormContent: (content: string) => void;
  formFeatured: boolean;
  setFormFeatured: (featured: boolean) => void;
  formTrending: boolean;
  setFormTrending: (trending: boolean) => void;
  formIsPartner: boolean;
  setFormIsPartner: (partner: boolean) => void;
  formAuthorName: string;
  setFormAuthorName: (name: string) => void;
  formAuthorRole: string;
  setFormAuthorRole: (role: string) => void;
  formAuthorAvatar: string;
  setFormAuthorAvatar: (avatar: string) => void;
  currentUser: any;
  showPreview: boolean;
  setShowPreview: (preview: boolean) => void;
  handleUploadHeroImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadGalleryImages: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveGalleryImage: (url: string) => void;
  handleSave: (e: React.FormEvent) => void;

  aiExpanded: boolean;
  setAiExpanded: (expanded: boolean) => void;
  aiGenerating: boolean;
  aiTopic: string;
  setAiTopic: (topic: string) => void;
  aiTone: string;
  setAiTone: (tone: string) => void;
  aiInstructions: string;
  setAiInstructions: (instr: string) => void;
  aiError: string;
  aiSuccess: string;
  handleRunAiWriter: () => void;
}

export const ArticleFormDrawer: React.FC<ArticleFormDrawerProps> = ({
  aiIncludeVideo,
  setAiIncludeVideo,
  isDrawerOpen,
  setIsDrawerOpen,
  editingArticle,
  formId,
  setFormId,
  formTitle,
  setFormTitle,
  formSummary,
  setFormSummary,
  formCategory,
  setFormCategory,
  formImage,
  setFormImage,
  formImageUrls,
  isUploadingImage,
  isUploadingGallery,
  formVideoSrc,
  setFormVideoSrc,
  formVideoPoster,
  setFormVideoPoster,
  formContent,
  setFormContent,
  formFeatured,
  setFormFeatured,
  formTrending,
  setFormTrending,
  formIsPartner,
  setFormIsPartner,
  formAuthorName,
  setFormAuthorName,
  formAuthorRole,
  setFormAuthorRole,
  formAuthorAvatar,
  setFormAuthorAvatar,
  currentUser,
  showPreview,
  setShowPreview,
  handleUploadHeroImage,
  handleUploadGalleryImages,
  handleRemoveGalleryImage,
  handleSave,
  aiExpanded,
  setAiExpanded,
  aiGenerating,
  aiTopic,
  setAiTopic,
  aiTone,
  setAiTone,
  aiInstructions,
  setAiInstructions,
  aiError,
  aiSuccess,
  handleRunAiWriter,
}) => {
  const [activeTab, setActiveTab] = React.useState<'ai' | 'manual'>(editingArticle ? 'manual' : 'ai');

  React.useEffect(() => {
    if (aiSuccess) {
      const timer = setTimeout(() => {
        setActiveTab('manual');
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [aiSuccess]);

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white dark:bg-brand-dark flex flex-col animate-fade-in overflow-hidden">
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
          <h2 className="font-serif text-sm font-black text-neutral-850 dark:text-white uppercase tracking-wider">
            {editingArticle ? `Edit Draft (${editingArticle.id})` : "Create New Publication"}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-3.5 py-1.5 border-[0.5px] border-neutral-250 dark:border-neutral-800 text-xs font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
          >
            {showPreview ? "Hide Live Preview" : "Show Live Preview"}
          </button>

          <button
            type="submit"
            form="article-editor-form"
            className="px-5 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold rounded-lg hover:opacity-90 transition-opacity cursor-pointer border-none"
          >
            {editingArticle
              ? currentUser?.role === "SUPER_ADMIN"
                ? "Save & Publish"
                : "Update Draft"
              : currentUser?.role === "SUPER_ADMIN"
              ? "Publish Article"
              : "Submit for Approval"}
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex">
        <form
          id="article-editor-form"
          onSubmit={handleSave}
          className={`${showPreview ? "w-1/2" : "w-full"} overflow-y-auto p-6 md:p-8 space-y-6 border-r-[0.5px] border-neutral-200 dark:border-neutral-850 text-left`}
        >
          {/* Redesigned Tab Bar */}
          <div className="flex border-b-[0.5px] border-neutral-200 dark:border-neutral-800 mb-6 select-none bg-neutral-50/50 dark:bg-neutral-900/10 rounded-xl p-1.5 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('ai')}
              className={`flex-grow py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border-none ${
                activeTab === 'ai'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-sm'
                  : 'bg-transparent text-neutral-450 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <i className="fa-solid fa-wand-magic-sparkles text-[10px]"></i>
              <span>AI Composer</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`flex-grow py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer border-none ${
                activeTab === 'manual'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-sm'
                  : 'bg-transparent text-neutral-450 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <i className="fa-solid fa-pen-nib text-[10px]"></i>
              <span>Manual Editor</span>
            </button>
          </div>

          {/* AI Composer Tab Content */}
          {activeTab === 'ai' && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-[0.5px] border-neutral-200 dark:border-neutral-800 p-5 rounded-2xl bg-neutral-50/30 dark:bg-neutral-900/5 space-y-5">
                <div className="flex items-center gap-2 border-b-[0.5px] border-neutral-200 dark:border-neutral-800 pb-3 mb-2 select-none">
                  <i className="fa-solid fa-sparkles text-accent-purple text-sm"></i>
                  <span className="text-[10px] font-extrabold uppercase text-neutral-500 tracking-wider">
                    Copilot Generation Settings
                  </span>
                </div>

                {aiGenerating ? (
                  <div className="py-8 flex flex-col items-center justify-center">
                    <GlowingFluidOrb message="Copilot generating draft structure..." size="md" />
                  </div>
                ) : (
                  <>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                          AI Prompt/Topic Description *
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 5 essential steps to learn React 19 for beginners"
                          value={aiTopic}
                          onChange={(e) => setAiTopic(e.target.value)}
                          className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-800 dark:text-neutral-200"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                            Editorial Tone
                          </label>
                          <select
                            value={aiTone}
                            onChange={(e) => setAiTone(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-800 dark:text-neutral-200"
                          >
                            <option value="Professional & Analytical">Professional & Analytical</option>
                            <option value="Casual & Friendly">Casual & Friendly</option>
                            <option value="Tech-Savy & Deep-Dive">Tech-Savy & Deep-Dive</option>
                            <option value="Inspirational & Creative">Inspirational & Creative</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                            Custom Instructions
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. Include code snippets"
                            value={aiInstructions}
                            onChange={(e) => setAiInstructions(e.target.value)}
                            className="w-full px-4 py-3 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-800 dark:text-neutral-200"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-[0.5px] border-neutral-200 dark:border-neutral-800 p-4 rounded-xl bg-white dark:bg-neutral-900">
                        <div className="pr-4">
                          <span className="text-xs font-bold text-neutral-855 dark:text-neutral-100 block">AI YouTube Video Suggestion</span>
                          <span className="text-[10px] text-neutral-400 block mt-0.5">Let AI automatically search and append a matching YouTube video.</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={aiIncludeVideo}
                          onChange={(e) => setAiIncludeVideo(e.target.checked)}
                          className="w-4 h-4 text-accent-purple border-neutral-300 rounded focus:ring-accent-purple cursor-pointer"
                        />
                      </div>
                    </div>

                    {aiError && <div className="text-[10px] text-red-500 font-bold font-mono">{aiError}</div>}
                    {aiSuccess && <div className="text-[10px] text-emerald-500 font-bold font-mono">{aiSuccess}</div>}

                    <AnimatedButton
                      type="button"
                      disabled={aiGenerating}
                      onClick={handleRunAiWriter}
                      variant="primary"
                      className="w-full py-3 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <i className="fa-solid fa-sparkles text-[10px]"></i>
                      <span>Generate Full Content Structure</span>
                    </AnimatedButton>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Manual Editor Tab Content */}
          {activeTab === 'manual' && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-455 dark:text-neutral-400 uppercase tracking-wider mb-2">
                    Article Title *
                  </label>
                  <input
                    required={activeTab === 'manual'}
                    type="text"
                    placeholder="Enter a compelling title..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-855 dark:text-neutral-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-455 dark:text-neutral-400 uppercase tracking-wider mb-2">
                    Unique Slug ID *
                  </label>
                  <input
                    required={activeTab === 'manual'}
                    disabled={!!editingArticle}
                    type="text"
                    placeholder="e.g. React-19-guide (use lowercase-hyphens)"
                    value={formId}
                    onChange={(e) => setFormId(e.target.value.toLowerCase().replace(/[^a-z0-9\-]+/g, "-"))}
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-855 dark:text-neutral-100 disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-neutral-455 dark:text-neutral-400 uppercase tracking-wider mb-2">
                    Magazine Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-855 dark:text-neutral-100"
                  >
                    <option value="Tech">Tech</option>
                    <option value="Art">Art</option>
                    <option value="Design">Design</option>
                    <option value="Music">Music</option>
                    <option value="Trends">Trends</option>
                    <option value="Podcast">Podcast</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-455 dark:text-neutral-400 uppercase tracking-wider mb-2">
                    Cover Hero Image *
                  </label>
                  <div className="flex gap-2">
                    <input
                      required={activeTab === 'manual'}
                      type="text"
                      placeholder="https://images.unsplash.com/..."
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-855 dark:text-neutral-100"
                    />
                    <label className="relative shrink-0 flex items-center justify-center px-4 border-[0.5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900 rounded-xl transition-all text-xs font-bold cursor-pointer text-neutral-800 dark:text-neutral-255 select-none">
                      {isUploadingImage ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-900 dark:border-white"></div>
                      ) : (
                        <>
                          <i className="fa-solid fa-cloud-arrow-up mr-1.5"></i>
                          Upload File
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadHeroImage}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-455 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Article Gallery Images (Optional)
                </label>
                <div className="border-[0.5px] border-dashed border-neutral-200 dark:border-neutral-800 p-6 rounded-xl text-center space-y-4 bg-neutral-50/50 dark:bg-neutral-900/10">
                  <label className="inline-flex items-center justify-center px-5 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-850 rounded-lg text-xs font-bold cursor-pointer text-neutral-800 dark:text-neutral-200 transition-colors shadow-sm select-none">
                    {isUploadingGallery ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-neutral-900 dark:border-white mr-2"></div>
                    ) : (
                      <i className="fa-solid fa-images mr-1.5 text-accent-purple"></i>
                    )}
                    <span>Select Multiple Gallery Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleUploadGalleryImages}
                      disabled={isUploadingGallery}
                      className="hidden"
                    />
                  </label>

                  {formImageUrls.length > 0 && (
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3 pt-3 border-t-[0.5px] border-neutral-250 dark:border-neutral-850">
                      {formImageUrls.map((url, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border-[0.5px] border-neutral-200 dark:border-neutral-800 shadow-sm bg-white dark:bg-neutral-900">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryImage(url)}
                            className="absolute inset-0 bg-red-500/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs border-none cursor-pointer"
                            title="Remove image"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="border-[0.5px] border-neutral-200 dark:border-neutral-800 p-4 rounded-xl space-y-4 bg-neutral-50/50 dark:bg-neutral-900/10">
                <span className="block text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider flex items-center gap-1.5">
                  <i className="fa-solid fa-sliders text-accent-purple"></i>
                  <span>Display Options & Layout Roles</span>
                </span>

                <div className="flex items-center justify-between">
                  <div className="pr-4">
                    <span className="text-xs font-bold text-neutral-855 dark:text-neutral-100 block">Featured Post</span>
                    <span className="text-[10px] text-neutral-400 block mt-0.5">Render in the premium hero section at the top of homepage.</span>
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
                    <span className="text-xs font-bold text-neutral-855 dark:text-neutral-100 block">Trending Post</span>
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

              <div>
                <label className="block text-xs font-bold text-neutral-455 dark:text-neutral-400 uppercase tracking-wider mb-2">
                  Article Summary / Excerpt *
                </label>
                <textarea
                  required={activeTab === 'manual'}
                  rows={3}
                  placeholder="Write a brief editorial hook that summarises the core story outline..."
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-855 dark:text-neutral-100 resize-y"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-455 dark:text-neutral-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Body Content (Markdown README format) *</span>
                  <span className="text-[10px] text-neutral-455 normal-case font-normal">
                    Double-newline separates paragraphs.
                  </span>
                </label>
                <textarea
                  required={activeTab === 'manual'}
                  rows={14}
                  placeholder="Write in Markdown. Support for headings (#), lists (-), bold (**), italic (*), code blocks (```) and blockquotes (>)."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full px-4 py-2.5 bg-neutral-50 dark:bg-neutral-900/50 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-855 dark:text-neutral-100 resize-y font-mono"
                ></textarea>
                <div className="text-[10px] text-neutral-450 mt-1 flex justify-between">
                  <span>
                    Paragraphs split count:{" "}
                    {formContent.split(/\n\n+/).filter((p) => p.trim().length > 0).length}
                  </span>
                  <span>Markdown formatting active</span>
                </div>
              </div>

          {currentUser?.role === "SUPER_ADMIN" && (
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
                    className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none text-neutral-855 dark:text-neutral-200"
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
          </div>
          )}
        </form>

        {showPreview && (
          <div className="w-1/2 bg-white dark:bg-brand-dark overflow-y-auto p-8 md:p-12 flex flex-col items-center">
            <div className="w-full max-w-xl text-left space-y-6">
              <div className="flex items-center justify-between border-b-[0.5px] border-neutral-200 dark:border-neutral-855 pb-3 mb-2 select-none">
                <span className="text-[9px] font-extrabold uppercase bg-neutral-100 dark:bg-neutral-850 text-neutral-500 dark:text-neutral-400 px-2 py-0.5 rounded-md tracking-wider animate-pulse">
                  Live Markdown Preview
                </span>
                <span className="text-[9px] text-neutral-400 dark:text-neutral-550 italic">
                  THE CAMPFIRE Publishing Layout
                </span>
              </div>

              {formImage && (
                <div className="w-full aspect-[16/10] bg-neutral-100 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-sm animate-scale-up">
                  <img src={formImage} alt="Cover Preview" className="w-full h-full object-cover" />
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
  );
};

export default ArticleFormDrawer;
