/**
 * Author: Deshan Jayashanka
 */

import React from "react";
import type { ReviewRule } from "../../api";

interface AiRulesModalProps {
  isRulesModalOpen: boolean;
  setIsRulesModalOpen: (open: boolean) => void;
  isRulesLoading: boolean;
  rules: ReviewRule[];
  editingRule: ReviewRule | null;
  ruleFormName: string;
  setRuleFormName: (val: string) => void;
  ruleFormCriteria: string;
  setRuleFormCriteria: (val: string) => void;
  ruleFormActive: boolean;
  setRuleFormActive: (val: boolean) => void;
  handleSaveRule: (e: React.FormEvent) => void;
  handleEditRule: (rule: ReviewRule) => void;
  handleDeleteRule: (id: string) => void;
  setEditingRule: (rule: ReviewRule | null) => void;
}

export const AiRulesModal: React.FC<AiRulesModalProps> = ({
  isRulesModalOpen,
  setIsRulesModalOpen,
  isRulesLoading,
  rules,
  editingRule,
  ruleFormName,
  setRuleFormName,
  ruleFormCriteria,
  setRuleFormCriteria,
  ruleFormActive,
  setRuleFormActive,
  handleSaveRule,
  handleEditRule,
  handleDeleteRule,
  setEditingRule,
}) => {
  if (!isRulesModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 select-none animate-fade-in backdrop-blur-sm">
      <div className="bg-white dark:bg-brand-dark w-full max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex flex-col border-[0.5px] border-neutral-200 dark:border-neutral-800">
        <div className="h-14 border-b-[0.5px] border-neutral-200 dark:border-neutral-800 px-6 bg-neutral-50 dark:bg-neutral-900/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-robot text-accent-purple text-sm"></i>
            <h3 className="font-serif text-lg font-black text-neutral-900 dark:text-white text-left">
              AI Editorial Review Rules
            </h3>
          </div>
          <button
            onClick={() => setIsRulesModalOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center transition-colors cursor-pointer border-none text-neutral-550 hover:text-neutral-800 dark:hover:text-white"
          >
            <i className="fa-solid fa-xmark text-sm"></i>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-5/12 bg-neutral-50/50 dark:bg-neutral-900/10 p-5 rounded-2xl border-[0.5px] border-neutral-200 dark:border-neutral-800 flex flex-col justify-between">
            <form onSubmit={handleSaveRule} className="space-y-4">
              <h4 className="text-xs font-extrabold uppercase text-neutral-400 tracking-wider text-left">
                {editingRule ? "Edit Review Rule" : "Create New Rule"}
              </h4>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-455 mb-1.5 text-left">
                  Rule Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Hate Speech check, Formatting..."
                  value={ruleFormName}
                  onChange={(e) => setRuleFormName(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-800 dark:text-neutral-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-455 mb-1.5 text-left">
                  Rule Criteria / Instructions *
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Specify instructions for the AI reviewer (e.g. Check that the article does not contain placeholder content or toxic text. It should use professional language.)"
                  value={ruleFormCriteria}
                  onChange={(e) => setRuleFormCriteria(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-accent-purple text-neutral-800 dark:text-neutral-200 resize-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="ruleFormActive"
                  checked={ruleFormActive}
                  onChange={(e) => setRuleFormActive(e.target.checked)}
                  className="w-4 h-4 text-accent-purple border-neutral-300 rounded focus:ring-accent-purple cursor-pointer"
                />
                <label
                  htmlFor="ruleFormActive"
                  className="text-xs font-bold text-neutral-600 dark:text-neutral-305 cursor-pointer"
                >
                  Rule is Active
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2 px-4 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold rounded-lg hover:opacity-90 transition-all cursor-pointer border-none"
                >
                  {editingRule ? "Save Changes" : "Add Rule"}
                </button>
                {editingRule && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingRule(null);
                      setRuleFormName("");
                      setRuleFormCriteria("");
                      setRuleFormActive(true);
                    }}
                    className="py-2 px-4 border-[0.5px] border-neutral-200 dark:border-neutral-800 text-xs font-bold rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-900 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="w-full md:w-7/12 flex flex-col space-y-4">
            <h4 className="text-xs font-extrabold uppercase text-neutral-400 tracking-wider text-left">
              Active Criteria Set ({rules.length})
            </h4>

            {isRulesLoading ? (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent-purple mx-auto"></div>
                <span className="text-xs font-medium text-neutral-400 mt-3 block font-mono">Syncing rules...</span>
              </div>
            ) : rules.length === 0 ? (
              <div className="py-16 text-center border-[0.5px] border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
                <i className="fa-solid fa-folder-open text-2xl text-neutral-300 dark:text-neutral-700 mb-3 block"></i>
                <p className="text-xs font-serif italic text-neutral-400">No custom rules defined yet.</p>
                <p className="text-[10px] text-neutral-400 mt-1 max-w-[240px] mx-auto">
                  AI review will fallback to default grammar, length and fact-checking checks.
                </p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1.5">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="p-4 bg-white dark:bg-brand-dark border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-xl space-y-2 group shadow-sm text-left"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-855 dark:text-neutral-105 block">
                        {rule.name}
                      </span>
                      <div className="flex items-center gap-2">
                        {rule.is_active ? (
                          <span className="text-[9px] bg-emerald-500/10 border-[0.5px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                            Active
                          </span>
                        ) : (
                          <span className="text-[9px] bg-neutral-100 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-850 text-neutral-450 px-2 py-0.5 rounded font-bold uppercase tracking-wide">
                            Disabled
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 leading-relaxed font-mono whitespace-pre-wrap">
                      {rule.criteria}
                    </p>
                    <div className="flex gap-2 justify-end pt-1 border-t-[0.5px] border-neutral-100 dark:border-neutral-900/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => handleEditRule(rule)}
                        className="text-[10px] font-bold text-accent-purple hover:underline cursor-pointer border-none bg-transparent"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => rule.id && handleDeleteRule(rule.id)}
                        className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer border-none bg-transparent"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiRulesModal;
