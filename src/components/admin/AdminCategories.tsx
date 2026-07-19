import React, { useState, useEffect } from "react";
import { FolderPlus, Search, PencilSparkles, Trash2, Trash, CheckSquare, FolderTree } from "lucide-react";
import { fetchCategories, createCategory, updateCategory, deleteCategory, type TaxonomyStatus } from "../../api";
import { AdminHeader } from "./AdminHeader";
import { Pagination } from "../common/Pagination";
import { LoadingScreen } from "../common/LoadingScreen";
import { NoDataScreen } from "../common/NoDataScreen";

interface Category {
  id: string;
  name: string;
  slug: string;
  count: number;
  status: TaxonomyStatus;
}

export const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<TaxonomyStatus>("ACTIVE");

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(currentCategories.map(c => c.id));
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

  // Save Add/Edit
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name, slug, status });
      } else {
        await createCategory({ name, slug, status });
      }
      await loadCategories();
    } catch (error) {
      console.error("Failed to save category:", error);
      alert("Failed to save category. Please check your slug uniqueness.");
    }

    setIsModalOpen(false);
    setEditingCategory(null);
    setName("");
    setSlug("");
    setStatus("ACTIVE");
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setStatus(cat.status);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id);
        await loadCategories();
        setSelectedIds(prev => prev.filter(item => item !== id));
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} categories?`)) {
      try {
        for (const id of selectedIds) {
          await deleteCategory(id);
        }
        await loadCategories();
        setSelectedIds([]);
      } catch (error) {
        console.error("Failed to bulk delete categories:", error);
      }
    }
  };

  const handleBulkToggleStatus = async () => {
    try {
      for (const id of selectedIds) {
        const cat = categories.find(c => c.id === id);
        if (cat) {
          const nextStatus: TaxonomyStatus = cat.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
          await updateCategory(id, { name: cat.name, slug: cat.slug, status: nextStatus });
        }
      }
      await loadCategories();
      setSelectedIds([]);
    } catch (error) {
      console.error("Failed to toggle categories status:", error);
    }
  };

  // Filter logic
  const filteredCategories = categories.filter(cat => {
    const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "All" || cat.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="flex h-full w-full bg-white overflow-hidden text-sm relative">

      {/* Middle Pane: Categories Table */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">

        <AdminHeader
          title="Categories"
          icon={FolderTree}
          badge={`${categories.length} total`}
        >
          <button
            onClick={() => {
              setEditingCategory(null);
              setName("");
              setSlug("");
              setStatus("ACTIVE");
              setIsModalOpen(true);
            }}
            className="main-button"
          >
            <FolderPlus size={14} /> New Category
          </button>
        </AdminHeader>

        {/* Filters bar */}
        <div className="px-6 py-3.5 border-b border-gray-200 shrink-0 bg-gray-50 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="customDropdown text-xs text-gray-700"
            >
              <option value="All">Status: All</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search category name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="customInput w-full pl-9"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-grow overflow-auto">
          {loading ? (
            <LoadingScreen message="Loading categories..." />
          ) : (
            <>
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-white border-b border-gray-150 text-[10px] uppercase font-bold tracking-wider text-gray-500 select-none">
                    <th className="w-12 px-6 py-3.5">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={currentCategories.length > 0 && selectedIds.length === currentCategories.length}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-3.5 font-bold">Category Name</th>
                    <th className="px-6 py-3.5 font-bold">Slug URL</th>
                    <th className="px-6 py-3.5 font-bold">Articles</th>
                    <th className="px-6 py-3.5 font-bold">Status</th>
                    <th className="px-6 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {currentCategories.map((cat) => {
                    const isSelected = selectedIds.includes(cat.id);
                    return (
                      <tr key={cat.id} className={`hover:bg-gray-50/50 transition-colors ${isSelected ? "bg-blue-50/20" : ""}`}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(cat.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-500 text-xs">
                              {cat.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{cat.name}</div>
                              <div className="text-[10px] text-gray-400">ID: {cat.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono text-[11px] text-gray-500">
                          /{cat.slug}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-gray-800">{cat.count}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cat.status === "ACTIVE"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cat.status === "ACTIVE" ? "bg-green-500" : "bg-gray-400"}`}></span>
                            {cat.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEdit(cat)}
                              className="admin-action-btn edit"
                              title="Edit"
                            >
                              <PencilSparkles size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(cat.id)}
                              className="admin-action-btn delete"
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

              {filteredCategories.length === 0 && (
                <NoDataScreen message="No categories found matching filters." />
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
              <Trash size={13} /> Delete Categories
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
                <h2>{editingCategory ? "Edit Category" : "Add Category"}</h2>
                <p>{editingCategory ? "Modify the category fields below" : "Create a new category for your articles"}</p>
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
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Category Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="e.g. Travel Guides"
                  className="inputField-custom w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Custom Slug (Optional)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="e.g. travel-guides"
                  className="inputField-custom w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Status</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as TaxonomyStatus)}
                  className="selectField-custom w-full cursor-pointer"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
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
                {editingCategory ? "Save Changes" : "Create Category"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminCategories;
