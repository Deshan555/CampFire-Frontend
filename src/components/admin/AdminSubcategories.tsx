import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Download, Upload, Trash, CheckSquare } from "lucide-react";
import { fetchSubcategories, createSubcategory, updateSubcategory, deleteSubcategory, fetchCategories } from "../../api";
import { Pagination } from "../common/Pagination";

interface Subcategory {
  id: string;
  name: string;
  parentName: string;
  slug: string;
  count: number;
  status: "Active" | "Inactive";
}

export const AdminSubcategories: React.FC = () => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [parentCategories, setParentCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [parentFilter, setParentFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal / Add state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [name, setName] = useState("");
  const [parentName, setParentName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [subsData, catsData] = await Promise.all([
        fetchSubcategories(),
        fetchCategories()
      ]);
      setSubcategories(subsData);
      const catNames = catsData.map((c: any) => c.name);
      setParentCategories(catNames);
      if (catNames.length > 0) {
        setParentName(catNames[0]);
      }
    } catch (error) {
      console.error("Failed to load subcategories data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(currentSubs.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds(prev => [...prev, id]);
    } else {
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  // Add/Edit Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !parentName) return;

    const computedSlug = slug.trim() || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    try {
      if (editingSub) {
        await updateSubcategory(editingSub.id, { name, parentName, slug: computedSlug, status });
      } else {
        await createSubcategory({ name, parentName, slug: computedSlug, status });
      }
      await loadData();
    } catch (error) {
      console.error("Failed to save subcategory:", error);
      alert("Failed to save subcategory.");
    }

    setIsModalOpen(false);
    setEditingSub(null);
    setName("");
    setSlug("");
    setStatus("Active");
  };

  const handleEdit = (sub: Subcategory) => {
    setEditingSub(sub);
    setName(sub.name);
    setParentName(sub.parentName);
    setSlug(sub.slug);
    setStatus(sub.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this subcategory?")) return;
    try {
      await deleteSubcategory(id);
      await loadData();
      setSelectedIds(prev => prev.filter(item => item !== id));
    } catch (error) {
      console.error("Failed to delete subcategory:", error);
      alert("Failed to delete subcategory.");
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} subcategories?`)) return;
    try {
      await Promise.all(selectedIds.map(id => deleteSubcategory(id)));
      await loadData();
      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to bulk delete subcategories:", error);
      alert("Failed to delete some subcategories.");
    }
  };

  const handleBulkToggleStatus = async () => {
    try {
      await Promise.all(selectedIds.map(id => {
        const sub = subcategories.find(s => s.id === id);
        if (!sub) return Promise.resolve();
        const nextStatus = sub.status === "Active" ? "Inactive" : "Active";
        return updateSubcategory(id, { name: sub.name, parentName: sub.parentName, slug: sub.slug, status: nextStatus });
      }));
      await loadData();
      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to bulk update status:", error);
      alert("Failed to update status for some subcategories.");
    }
  };

  // Filtering
  const filteredSubs = subcategories.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesParent = parentFilter === "All" || s.parentName === parentFilter;
    const matchesStatus = statusFilter === "All" || s.status === statusFilter;
    return matchesSearch && matchesParent && matchesStatus;
  });

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, parentFilter, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredSubs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSubs = filteredSubs.slice(indexOfFirstItem, indexOfLastItem);



  return (
    <div className="flex h-full w-full bg-white overflow-hidden text-sm relative">

      {/* Middle Pane: Subcategories Table */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">

        {/* Sub-Header actions */}
        <div className="p-6 border-b border-gray-200 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Subcategories</h2>
            <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">
              {subcategories.length} total
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="secondary-button">
              <Upload size={14} /> Import
            </button>
            <button className="secondary-button">
              <Download size={14} /> Export
            </button>
            <button
              onClick={() => {
                setEditingSub(null);
                setName("");
                setParentName(parentCategories[0]);
                setSlug("");
                setStatus("Active");
                setIsModalOpen(true);
              }}
              className="main-button"
            >
              <Plus size={14} /> Add Subcategory
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="px-6 py-3.5 border-b border-gray-200 shrink-0 bg-gray-50 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <select
              value={parentFilter}
              onChange={e => setParentFilter(e.target.value)}
              className="customDropdown text-xs text-gray-700"
            >
              <option value="All">Parent Category: All</option>
              {parentCategories.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="customDropdown text-xs text-gray-700"
            >
              <option value="All">Status: All</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search subcategory..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="customInput w-full pl-9"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-grow overflow-auto">
          {loading ? (
            <div className="p-12 text-center text-gray-400 text-xs">
              Loading subcategories...
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-white border-b border-gray-150 text-[10px] uppercase font-bold tracking-wider text-gray-500 select-none">
                    <th className="w-12 px-6 py-3.5">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={currentSubs.length > 0 && selectedIds.length === currentSubs.length}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-3.5 font-bold">Subcategory</th>
                    <th className="px-6 py-3.5 font-bold">Parent Category</th>
                    <th className="px-6 py-3.5 font-bold">Slug</th>
                    <th className="px-6 py-3.5 font-bold">Articles Count</th>
                    <th className="px-6 py-3.5 font-bold">Status</th>
                    <th className="px-6 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {currentSubs.map((sub) => {
                    const isSelected = selectedIds.includes(sub.id);
                    return (
                      <tr key={sub.id} className={`hover:bg-gray-50/50 transition-colors ${isSelected ? "bg-blue-50/20" : ""}`}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(sub.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-gray-900">{sub.name}</div>
                          <div className="text-[10px] text-gray-400">ID: {sub.id}</div>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-600">
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 text-gray-700 border border-gray-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {sub.parentName}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-gray-500">
                          /{sub.slug}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-800">{sub.count}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${sub.status === "Active"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sub.status === "Active" ? "bg-green-500" : "bg-gray-400"}`}></span>
                            {sub.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEdit(sub)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredSubs.length === 0 && (
                <div className="p-12 text-center text-gray-400 text-xs">
                  No subcategories found matching filters.
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#0B0D14] text-white py-3 px-6 rounded-xl flex items-center gap-6 shadow-2xl border border-[#2B384F] z-30 transition-all transform scale-100 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <span className="text-xs font-semibold text-gray-300">
            Selected: <strong className="text-white">{selectedIds.length}</strong>
          </span>
          <div className="h-4 w-px bg-gray-700"></div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkToggleStatus}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-300 hover:text-white px-2.5 py-1 hover:bg-[#1E2536] rounded-md transition-colors"
            >
              <CheckSquare size={13} /> Toggle Status
            </button>
            <button
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 px-2.5 py-1 hover:bg-red-500/10 rounded-md transition-colors"
            >
              <Trash size={13} /> Delete Subcategories
            </button>
          </div>
        </div>
      )}

      {/* Modal Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <form onSubmit={handleSave} className="custom-modal-content w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="custom-modal-header">
              <div className="custom-modal-title-area">
                <h2>{editingSub ? "Edit Subcategory" : "Add Subcategory"}</h2>
                <p>{editingSub ? "Modify the subcategory fields below" : "Create a new subcategory definition"}</p>
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
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Subcategory Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="e.g. Europe Guides"
                  className="inputField-custom w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Parent Category</label>
                <select
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  className="selectField-custom w-full cursor-pointer"
                >
                  {parentCategories.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Custom Slug (Optional)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="e.g. europe-guides"
                  className="inputField-custom w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as "Active" | "Inactive")}
                  className="selectField-custom w-full cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
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
                type="submit"
                className="main-button"
              >
                {editingSub ? "Save Changes" : "Create Subcategory"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminSubcategories;
