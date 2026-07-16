import React, { useState, useEffect } from "react";
import { Plus, Check, Search, Bot, Edit2, Trash2 } from "lucide-react";
import { fetchRules, createRule, updateRule, deleteRule, type ReviewRule } from "../../api";

const BLOG_SITE_ID = "11111111-1111-1111-1111-111111111111";

const AdminAiSettings: React.FC = () => {
  const [rules, setRules] = useState<ReviewRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<ReviewRule | null>(null);

  const [ruleName, setRuleName] = useState("");
  const [rulePrompt, setRulePrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadRules();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      const data = await fetchRules(BLOG_SITE_ID);
      setRules(data);
    } catch (error) {
      console.error("Failed to load rules", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRuleActive = async (rule: ReviewRule) => {
    try {
      await updateRule(rule.id as string, { name: rule.name, criteria: rule.criteria, isActive: !rule.is_active });
      loadRules();
    } catch (error) {
      console.error("Failed to toggle rule", error);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this rule?")) return;
    try {
      await deleteRule(id);
      loadRules();
    } catch (error) {
      console.error("Failed to delete rule", error);
    }
  };

  const openModal = (rule?: ReviewRule) => {
    if (rule) {
      setEditingRule(rule);
      setRuleName(rule.name);
      setRulePrompt(rule.criteria);
    } else {
      setEditingRule(null);
      setRuleName("");
      setRulePrompt("Check if the article meets the following criteria: [CRITERIA]");
    }
    setIsModalOpen(true);
  };

  const handleSaveRule = async () => {
    if (!ruleName.trim()) return;
    setIsSaving(true);
    try {
      if (editingRule) {
        await updateRule(editingRule.id as string, {
          name: ruleName,
          criteria: rulePrompt,
          isActive: editingRule.is_active,
        });
      } else {
        await createRule({
          blogSiteId: BLOG_SITE_ID,
          name: ruleName,
          criteria: rulePrompt,
          isActive: true,
        });
      }
      setIsModalOpen(false);
      loadRules();
    } catch (error) {
      console.error("Failed to save rule", error);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredRules = rules.filter(r =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.criteria.toLowerCase().includes(searchQuery.toLowerCase())
  );



  return (
    <div className="flex h-full w-full bg-white overflow-hidden text-sm relative">

      {/* Middle Pane: AI Rules list */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">

        {/* Sub-Header actions */}
        <div className="p-6 border-b border-gray-200 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
              <Bot size={20} className="text-blue-600" />
              AI Review Rules
            </h2>
            <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">
              {rules.length} total
            </span>
          </div>
          <button
            onClick={() => openModal()}
            className="main-button"
          >
            <Plus size={14} /> Add AI Rule
          </button>
        </div>

        {/* Filters bar */}
        <div className="px-6 py-3.5 border-b border-gray-200 shrink-0 bg-gray-50 flex items-center justify-end gap-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search AI rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="customInput w-full pl-9"
            />
          </div>
        </div>

        {/* Content list */}
        <div className="flex-grow overflow-auto p-6">
          {loading ? (
            <div className="h-full flex justify-center items-center text-gray-400 text-xs">Loading rules...</div>
          ) : (
            <div className="grid gap-4 grid-cols-1 xl:grid-cols-2 content-start">
              {filteredRules.map(rule => (
                <div
                  key={rule.id}
                  className={`p-5 rounded-2xl border transition-all ${rule.is_active
                      ? "border-blue-200 bg-blue-50/10 shadow-sm"
                      : "border-gray-255 bg-gray-50/20"
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleToggleRuleActive(rule)}
                        className={`flex items-center justify-center w-5 h-5 rounded border transition-colors ${rule.is_active ? "bg-blue-600 border-blue-600 text-white" : "border-gray-300 bg-white"
                          }`}
                      >
                        {rule.is_active && <Check size={12} />}
                      </button>
                      <h3 className={`font-semibold text-xs ${rule.is_active ? "text-gray-900" : "text-gray-500"}`}>
                        {rule.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => openModal(rule)} className="p-1 text-gray-400 hover:text-blue-600 rounded">
                        <Edit2 size={13} />
                      </button>
                      <button onClick={() => handleDeleteRule(rule.id as string)} className="p-1 text-gray-400 hover:text-red-600 rounded">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className={`p-3 rounded-xl text-[11px] font-mono leading-relaxed line-clamp-3 ${rule.is_active ? "bg-white border border-blue-100 text-gray-700" : "bg-gray-100 text-gray-400"
                    }`}>
                    {rule.criteria}
                  </div>
                </div>
              ))}

              {filteredRules.length === 0 && (
                <div className="col-span-full py-12 text-center text-gray-400 text-xs border border-dashed border-gray-200 rounded-2xl">
                  No AI rules found. Click "Add AI Rule" to create one.
                </div>
              )}
            </div>
          )}
        </div>
      </div>



      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="custom-modal-content w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="custom-modal-header">
              <div className="custom-modal-title-area">
                <h2>{editingRule ? "Edit AI Review Rule" : "Add AI Review Rule"}</h2>
                <p>{editingRule ? "Modify the rule details below" : "Configure a new AI criteria check"}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="custom-modal-close"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 bg-white">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Rule Title</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={e => setRuleName(e.target.value)}
                  required
                  placeholder="e.g. Grammar Check"
                  className="inputField-custom w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">AI prompt criteria instructions</label>
                <textarea
                  value={rulePrompt}
                  onChange={e => setRulePrompt(e.target.value)}
                  required
                  placeholder="Verify if the article is written with proper grammar rules..."
                  className="textareaField-custom w-full font-mono"
                />
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="secondary-button"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRule}
                disabled={isSaving || !ruleName.trim()}
                className="main-button disabled:opacity-50"
              >
                {isSaving ? "Saving..." : editingRule ? "Save Rule" : "Create Rule"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAiSettings;
