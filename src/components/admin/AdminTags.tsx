import React, { useState, useEffect } from "react";
import { Plus, Search, Edit2, Trash2, Download, Upload, Trash } from "lucide-react";
import { Pagination } from "../common/Pagination";

interface Tag {
  id: string;
  name: string;
  slug: string;
  count: number;
}

const initialTags: Tag[] = [
  { id: "1", name: "Backpacking", slug: "backpacking", count: 32 },
  { id: "2", name: "Luxury", slug: "luxury", count: 18 },
  { id: "3", name: "Budget", slug: "budget", count: 45 },
  { id: "4", name: "Solo Travel", slug: "solo-travel", count: 27 },
  { id: "5", name: "Food", slug: "food", count: 50 },
  { id: "6", name: "Photography", slug: "photography", count: 11 },
];

export const AdminTags: React.FC = () => {
  const [tags, setTags] = useState<Tag[]>(initialTags);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal / Add state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");

  // Filtering
  const filteredTags = tags.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredTags.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTags = filteredTags.slice(indexOfFirstItem, indexOfLastItem);

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(currentTags.map(t => t.id));
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
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const computedSlug = slug.trim() || name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    if (editingTag) {
      setTags(prev => prev.map(t => t.id === editingTag.id ? { ...t, name, slug: computedSlug } : t));
    } else {
      const newTag: Tag = {
        id: Date.now().toString(),
        name,
        slug: computedSlug,
        count: 0
      };
      setTags(prev => [...prev, newTag]);
    }

    setIsModalOpen(false);
    setEditingTag(null);
    setName("");
    setSlug("");
  };

  const handleEdit = (tag: Tag) => {
    setEditingTag(tag);
    setName(tag.name);
    setSlug(tag.slug);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this tag?")) {
      setTags(prev => prev.filter(t => t.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} tags?`)) {
      setTags(prev => prev.filter(t => !selectedIds.includes(t.id)));
      setSelectedIds([]);
    }
  };

  return (
    <div className="flex h-full w-full bg-white overflow-hidden text-sm relative">

      {/* Middle Pane: Tags Table */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">

        {/* Sub-Header actions */}
        <div className="p-6 border-b border-gray-200 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Tags (Hashtags)</h2>
            <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">
              {tags.length} total
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
                setEditingTag(null);
                setName("");
                setSlug("");
                setIsModalOpen(true);
              }}
              className="main-button"
            >
              <Plus size={14} /> Add Tag
            </button>
          </div>
        </div>

        {/* Filters bar */}
        <div className="px-6 py-3.5 border-b border-gray-200 shrink-0 bg-gray-50 flex items-center justify-end gap-4">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tag name or slug..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="customInput w-full pl-9"
            />
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-grow overflow-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-white border-b border-gray-150 text-[10px] uppercase font-bold tracking-wider text-gray-500 select-none">
                <th className="w-12 px-6 py-3.5">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={currentTags.length > 0 && selectedIds.length === currentTags.length}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-3.5 font-bold">Tag</th>
                <th className="px-6 py-3.5 font-bold">Slug URL</th>
                <th className="px-6 py-3.5 font-bold">Articles Count</th>
                <th className="px-6 py-3.5 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {currentTags.map((tag) => {
                const isSelected = selectedIds.includes(tag.id);
                return (
                  <tr key={tag.id} className={`hover:bg-gray-50/50 transition-colors ${isSelected ? "bg-blue-50/20" : ""}`}>
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleSelectOne(tag.id, e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900 flex items-center gap-1.5">
                        <span className="text-gray-400 font-bold">#</span>
                        {tag.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-[11px] text-gray-500">
                      /{tag.slug}
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-800">
                      {tag.count}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(tag)}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(tag.id)}
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

          {filteredTags.length === 0 && (
            <div className="p-12 text-center text-gray-400 text-xs">
              No tags found matching filters.
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
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
              onClick={handleBulkDelete}
              className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 px-2.5 py-1 hover:bg-red-500/10 rounded-md transition-colors"
            >
              <Trash size={13} /> Delete Tags
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
                <h2>{editingTag ? "Edit Tag" : "Add Tag"}</h2>
                <p>{editingTag ? "Modify the tag fields below" : "Create a new tag definition"}</p>
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
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Tag Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  placeholder="e.g. Backpacking"
                  className="inputField-custom w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Custom Slug (Optional)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  placeholder="e.g. backpacking"
                  className="inputField-custom w-full"
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
                type="submit"
                className="main-button"
              >
                {editingTag ? "Save Changes" : "Create Tag"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminTags;
