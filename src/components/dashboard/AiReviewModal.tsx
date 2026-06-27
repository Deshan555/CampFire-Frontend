/**
 * Author: Deshan Jayashanka
 */

import React from "react";
import Markdown from "../Markdown";
import type { Article } from "../../data/articles";

interface AiReviewModalProps {
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (open: boolean) => void;
  isReviewing: boolean;
  reviewArticleTitle: string;
  reviewModel: string;
  setReviewModel: (val: string) => void;
  handleRunAiReview: () => void;
  reviewResult: { approved: boolean; feedback: string } | null;
  setReviewResult: (val: any) => void;
  reviewArticleId: string | null;
  articles: Article[];
  handleOpenEdit: (art: Article) => void;
}

export const AiReviewModal: React.FC<AiReviewModalProps> = ({
  isReviewModalOpen,
  setIsReviewModalOpen,
  isReviewing,
  reviewArticleTitle,
  reviewModel,
  setReviewModel,
  handleRunAiReview,
  reviewResult,
  setReviewResult,
  reviewArticleId,
  articles,
  handleOpenEdit,
}) => {
  if (!isReviewModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 select-none animate-fade-in backdrop-blur-sm">
      <div className="bg-white dark:bg-brand-dark w-full max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col border-[0.5px] border-neutral-200 dark:border-neutral-800">
        <div className="h-14 border-b-[0.5px] border-neutral-200 dark:border-neutral-800 px-6 bg-neutral-50 dark:bg-neutral-900/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-microchip text-accent-purple text-sm animate-pulse"></i>
            <h3 className="font-serif text-lg font-black text-neutral-900 dark:text-white text-left">
              Agentic AI Approval Engine
            </h3>
          </div>
          <button
            disabled={isReviewing}
            onClick={() => setIsReviewModalOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer border-none text-neutral-505 disabled:opacity-30"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
          {!reviewResult ? (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900/10 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl space-y-1.5 animate-fade-in">
                <span className="block text-[10px] font-extrabold uppercase text-neutral-404 tracking-wider">
                  Article Subject
                </span>
                <span className="block text-sm font-bold text-neutral-850 dark:text-white leading-snug">
                  {reviewArticleTitle}
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider mb-1.5">
                  Select LLM Model Agent
                </label>
                <select
                  value={reviewModel}
                  onChange={(e) => setReviewModel(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-800 dark:text-neutral-200"
                >
                  <option value="gemma3:1b">Gemma 3 1B (Lightweight & Quick)</option>
                  <option value="llama3.2:latest">Llama 3.2 3B (Precise Reasoning)</option>
                  <option value="deepseek-r1:1.5b">DeepSeek R1 1.5B (Distilled Reasoner)</option>
                  <option value="deepseek-r1:8b">DeepSeek R1 8B (Deep Reasoning)</option>
                </select>
              </div>

              <div className="bg-neutral-50/50 dark:bg-neutral-900/10 p-4 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl space-y-1 text-neutral-500">
                <p className="text-[10px] uppercase font-bold tracking-wide">About Agentic Review:</p>
                <p className="text-[11px] leading-relaxed">
                  The AI agent will analyze the article content against all active review rules set in your configurations. If the article passes, it will be automatically published. If it fails, the AI will document rule violations in detail.
                </p>
              </div>

              <button
                disabled={isReviewing}
                onClick={handleRunAiReview}
                className="w-full py-3 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold rounded-full hover:opacity-90 disabled:opacity-60 transition-all flex items-center justify-center gap-2 cursor-pointer border-none"
              >
                {isReviewing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white dark:border-neutral-900"></div>
                    <span>Evaluating submission...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-play text-[10px]"></i>
                    <span>Start Agentic AI Review</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center p-6 border-[0.5px] border-neutral-200 dark:border-neutral-850 rounded-2xl bg-neutral-50/30 dark:bg-neutral-900/5 select-none animate-fade-in">
                {reviewResult.approved ? (
                  <div className="text-center space-y-2 animate-fade-in">
                    <div className="w-14 h-14 bg-emerald-500/10 border-[0.5px] border-emerald-500/30 text-emerald-500 rounded-full flex items-center justify-center mx-auto text-xl shadow-sm animate-scale-up">
                      <i className="fa-solid fa-circle-check"></i>
                    </div>
                    <h4 className="font-serif text-lg font-black text-emerald-600 dark:text-emerald-400">
                      APPROVED BY AI REVIEWER
                    </h4>
                    <p className="text-[10px] text-neutral-450 uppercase font-bold tracking-wider">
                      Article automatically published
                    </p>
                  </div>
                ) : (
                  <div className="text-center space-y-2 animate-fade-in">
                    <div className="w-14 h-14 bg-red-500/10 border-[0.5px] border-red-500/30 text-red-555 rounded-full flex items-center justify-center mx-auto text-xl shadow-sm animate-scale-up">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <h4 className="font-serif text-lg font-black text-red-655 dark:text-red-400">
                      REJECTED BY AI REVIEWER
                    </h4>
                    <p className="text-[10px] text-neutral-450 uppercase font-bold tracking-wider">
                      Review logs updated
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <span className="block text-[10px] font-extrabold uppercase text-neutral-400 tracking-wider">
                  Evaluation Logs & Feedback
                </span>
                <div className="p-5 bg-neutral-50 dark:bg-neutral-900/40 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl leading-relaxed text-xs text-neutral-800 dark:text-neutral-200 font-mono overflow-y-auto max-h-[30vh]">
                  <Markdown content={reviewResult.feedback} />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsReviewModalOpen(false)}
                  className="flex-1 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold rounded-full hover:opacity-90 transition-all cursor-pointer border-none"
                >
                  Close Review Window
                </button>
                {!reviewResult.approved && (
                  <button
                    onClick={() => {
                      setReviewResult(null);
                      setIsReviewModalOpen(false);
                      const artToEdit = articles.find((a) => a.id === reviewArticleId);
                      if (artToEdit) handleOpenEdit(artToEdit);
                    }}
                    className="py-2.5 px-5 border-[0.5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 text-neutral-800 dark:text-neutral-200 text-xs font-bold rounded-full transition-all cursor-pointer"
                  >
                    Edit Article
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AiReviewModal;
