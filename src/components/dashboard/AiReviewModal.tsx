/**
 * Author: Deshan Jayashanka
 */

import React from "react";
import Markdown from "../Markdown";
import Lottie from "lottie-react";
const LottieComponent = (Lottie as any).default || Lottie;
import robotWorkingAnimation from "../../assets/lottie/RobotWorking.json";
import type { Article } from "../../data/articles";
import type { ReviewRule } from "../../api";

interface AiReviewModalProps {
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (open: boolean) => void;
  isReviewing: boolean;
  reviewArticleTitle: string;
  reviewModel: string;
  setReviewModel: (val: string) => void;
  handleRunAiReview: (
    selectedRuleIds: string[],
    addedRules: { name: string; criteria: string }[]
  ) => void;
  reviewResult: { approved: boolean; feedback: string } | null;
  setReviewResult: (val: any) => void;
  reviewArticleId: string | null;
  articles: Article[];
  handleOpenEdit: (art: Article) => void;
  rules: ReviewRule[];
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
  rules,
}) => {
  const [selectedRuleIds, setSelectedRuleIds] = React.useState<string[]>([]);
  const [addedRules, setAddedRules] = React.useState<{ name: string; criteria: string }[]>([]);
  const [newRuleName, setNewRuleName] = React.useState("");
  const [newRuleCriteria, setNewRuleCriteria] = React.useState("");

  // Initialize and reset selections when modal opens
  React.useEffect(() => {
    if (isReviewModalOpen && rules) {
      // Pre-select rules that are active by default
      setSelectedRuleIds(
        rules.filter((r) => r.is_active && r.id).map((r) => r.id as string)
      );
      setAddedRules([]);
      setNewRuleName("");
      setNewRuleCriteria("");
    }
  }, [isReviewModalOpen, rules]);

  if (!isReviewModalOpen) return null;

  const handleStartReview = () => {
    handleRunAiReview(selectedRuleIds, addedRules);
  };

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
            className="w-8 h-8 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer border-none text-neutral-500 disabled:opacity-30"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-left">
          {isReviewing ? (
            <div className="flex-1 flex flex-col items-center justify-center py-16 text-center w-full">
              <LottieComponent animationData={robotWorkingAnimation} loop={true} style={{ height: 320 }} />
              <p className="mt-4 text-sm font-semibold text-neutral-600 dark:text-neutral-400 font-[Poppins]">
                Evaluating submission...
              </p>
            </div>
          ) : !reviewResult ? (
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
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-800 dark:text-neutral-200"
                >
                  <option value="gemma3:1b">Gemma 3 1B (Lightweight & Quick)</option>
                  <option value="llama3.2:latest">Llama 3.2 3B (Precise Reasoning)</option>
                  <option value="deepseek-r1:1.5b">DeepSeek R1 1.5B (Distilled Reasoner)</option>
                  <option value="deepseek-r1:8b">DeepSeek R1 8B (Deep Reasoning)</option>
                </select>
              </div>

              {/* Rules selection checklist */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Select Editorial Rules to Apply
                </label>
                <div className="space-y-2 max-h-[160px] overflow-y-auto border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 bg-neutral-50/50 dark:bg-neutral-900/10">
                  {rules && rules.length > 0 ? (
                    rules.map((rule) => (
                      <label
                        key={rule.id}
                        className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-neutral-150 dark:hover:bg-neutral-800 cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={selectedRuleIds.includes(rule.id as string)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRuleIds([...selectedRuleIds, rule.id as string]);
                            } else {
                              setSelectedRuleIds(
                                selectedRuleIds.filter((id) => id !== rule.id)
                              );
                            }
                          }}
                          className="mt-0.5 cursor-pointer accent-accent-purple"
                        />
                        <div className="text-xs">
                          <span className="font-bold text-neutral-800 dark:text-neutral-200 block">
                            {rule.name} {!rule.is_active && (
                              <span className="text-[10px] bg-neutral-200 dark:bg-neutral-850 px-1 py-0.5 rounded text-neutral-550 font-normal ml-1">Inactive</span>
                            )}
                          </span>
                          <span className="text-neutral-500 text-[11px] block mt-0.5">
                            {rule.criteria}
                          </span>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-neutral-500 italic text-[11px] text-center py-2">
                      No review rules configured in database.
                    </p>
                  )}
                </div>
              </div>

              {/* Add temporary rule */}
              <div className="space-y-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <label className="block text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
                  Add Custom Temporary Rule for this Review
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Rule Name (e.g. Tone Check)"
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-800 dark:text-neutral-200"
                  />
                  <input
                    type="text"
                    placeholder="Criteria (e.g. Must be conversational)"
                    value={newRuleCriteria}
                    onChange={(e) => setNewRuleCriteria(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-800 dark:text-neutral-200"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (newRuleName.trim() && newRuleCriteria.trim()) {
                      setAddedRules([
                        ...addedRules,
                        { name: newRuleName.trim(), criteria: newRuleCriteria.trim() },
                      ]);
                      setNewRuleName("");
                      setNewRuleCriteria("");
                    }
                  }}
                  className="py-1.5 px-4 bg-accent-purple/10 text-accent-purple hover:bg-accent-purple/20 text-[11px] font-bold rounded-lg border-none cursor-pointer transition-colors text-left inline-block"
                >
                  + Add Temporary Rule
                </button>

                {addedRules.length > 0 && (
                  <div className="space-y-1.5 mt-2">
                    <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
                      Temporary Rules to Apply:
                    </span>
                    <div className="space-y-1 bg-purple-50/20 dark:bg-purple-950/10 p-2.5 border border-accent-purple/20 rounded-xl">
                      {addedRules.map((rule, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-xs py-1.5 border-b border-neutral-100/50 dark:border-neutral-800/30 last:border-0"
                        >
                          <div>
                            <span className="font-bold text-neutral-800 dark:text-neutral-200">
                              {rule.name}:{" "}
                            </span>
                            <span className="text-neutral-500 dark:text-neutral-400">
                              {rule.criteria}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setAddedRules(addedRules.filter((_, i) => i !== idx))
                            }
                            className="text-red-500 hover:text-red-700 bg-transparent border-none cursor-pointer text-xs"
                          >
                            <i className="fa-solid fa-trash-can"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-neutral-50/50 dark:bg-neutral-900/10 p-4 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl space-y-1 text-neutral-500">
                <p className="text-[10px] uppercase font-bold tracking-wide">
                  About Agentic Review:
                </p>
                <p className="text-[11px] leading-relaxed">
                  The AI agent will analyze the article content against the selected and temporary rules. If the article passes, it will be automatically published. If it fails, the AI will document rule violations in detail.
                </p>
              </div>

              <button
                disabled={isReviewing}
                onClick={handleStartReview}
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
