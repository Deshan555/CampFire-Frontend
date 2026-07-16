import React, { useState, useEffect } from "react";
import { UserPlus, Search, Edit2, Trash2, Shield, Trash, CheckSquare } from "lucide-react";
import { fetchUsers, registerAdmin } from "../../api";
import { Pagination } from "../common/Pagination";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "super_admin" | "editor" | "author" | "reader";
  status: "Active" | "Inactive";
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal / Invite state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const [role, setRole] = useState<"super_admin" | "editor" | "author" | "reader">("editor");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchUsers();
      setUsers(data);
    } catch (error) {
      console.error("Failed to load admin users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Selection handlers
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(currentUsers.map(u => u.id));
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const { uploadFile } = await import("../../api");
      const res = await uploadFile(file);
      if (res.success && res.url) {
        setAvatarUrl(res.url);
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("Failed to upload avatar image.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Add/Edit Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !username.trim()) return;

    try {
      if (editingUser) {
        // Local state fallback since there's no backend PUT user endpoint yet
        setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, name: `${firstName} ${lastName}`.trim(), email, role, status } : u));
      } else {
        await registerAdmin({
          username,
          email,
          firstName,
          lastName,
          role: role.toUpperCase(),
          password: password || "TempPassword123!",
          avatarUrl,
          bio
        });

        await loadUsers();
      }
    } catch (error) {
      console.error("Failed to save admin user:", error);
      alert("Failed to save administrator.");
    }

    setIsModalOpen(false);
    setEditingUser(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setAvatarUrl("");
    setBio("");
    setRole("editor");
    setStatus("Active");
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    const nameParts = user.name.split(" ");
    setFirstName(nameParts[0] || user.name);
    setLastName(nameParts.slice(1).join(" ") || "");
    setEmail(user.email);
    setRole(user.role);
    setStatus(user.status);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      setUsers(prev => prev.filter(u => u.id !== id));
      setSelectedIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} users?`)) {
      setUsers(prev => prev.filter(u => !selectedIds.includes(u.id)));
      setSelectedIds([]);
    }
  };

  const handleBulkToggleStatus = () => {
    setUsers(prev => prev.map(u => {
      if (selectedIds.includes(u.id)) {
        return { ...u, status: u.status === "Active" ? "Inactive" : "Active" };
      }
      return u;
    }));
    setSelectedIds([]);
  };

  // Filtering
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "All" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, roleFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);



  return (
    <div className="flex h-full w-full bg-white overflow-hidden text-sm relative">

      {/* Middle Pane: Users Table */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">

        {/* Sub-Header actions */}
        <div className="p-6 border-b border-gray-200 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Administrators</h2>
            <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full">
              {users.length} total
            </span>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setUsername("");
              setFirstName("");
              setLastName("");
              setPassword("");
              setBio("");
              setAvatarUrl("");
              setEmail("");
              setRole("editor");
              setStatus("Active");
              setIsModalOpen(true);
            }}
            className="main-button"
          >
            <UserPlus size={14} /> Add Administrator
          </button>
        </div>

        {/* Filters bar */}
        <div className="px-6 py-3.5 border-b border-gray-200 shrink-0 bg-gray-50 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)}
              className="customDropdown text-xs text-gray-700"
            >
              <option value="All">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="editor">Editor</option>
              <option value="author">Author</option>
              <option value="reader">Reader</option>
            </select>
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
              Loading administrators...
            </div>
          ) : (
            <>
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-white border-b border-gray-150 text-[10px] uppercase font-bold tracking-wider text-gray-500 select-none">
                    <th className="w-12 px-6 py-3.5">
                      <input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={currentUsers.length > 0 && selectedIds.length === currentUsers.length}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                    </th>
                    <th className="px-6 py-3.5 font-bold">User</th>
                    <th className="px-6 py-3.5 font-bold">Role</th>
                    <th className="px-6 py-3.5 font-bold">Status</th>
                    <th className="px-6 py-3.5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                  {currentUsers.map((user) => {
                    const isSelected = selectedIds.includes(user.id);
                    return (
                      <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors ${isSelected ? "bg-blue-50/20" : ""}`}>
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectOne(user.id, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">{user.name}</div>
                              <div className="text-[10px] text-gray-400 font-mono">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${user.role === 'super_admin' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                              user.role === 'editor' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                user.role === 'author' ? 'bg-green-50 text-green-700 border-green-100' :
                                  'bg-gray-100 text-gray-700 border-gray-200'
                            }`}>
                            {user.role === 'super_admin' && <Shield size={10} />}
                            {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${user.status === 'Active' ? 'text-green-700 bg-green-50 border-green-200' : 'text-gray-600 bg-gray-100 border-gray-200'
                            }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleEdit(user)}
                              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(user.id)}
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

              {filteredUsers.length === 0 && (
                <div className="p-12 text-center text-gray-400 text-xs">
                  No users found matching filters.
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



      {/* Floating Bottom action bar for multiple selections (Mate Style) */}
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
              <Trash size={13} /> Remove Accounts
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
                <h2>{editingUser ? "Edit User Account" : "Add Administrator"}</h2>
                <p>{editingUser ? "Modify the administrator fields below" : "Invite or create a new administrator account"}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="custom-modal-close"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh] bg-white">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={e => setFirstName(e.target.value)}
                    required
                    placeholder="e.g. John"
                    className="inputField-custom w-full"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={e => setLastName(e.target.value)}
                    required
                    placeholder="e.g. Doe"
                    className="inputField-custom w-full"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Username</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    disabled={!!editingUser}
                    placeholder="e.g. johndoe"
                    className="inputField-custom w-full disabled:opacity-60"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required={!editingUser}
                    placeholder={editingUser ? "••••••••" : "Enter password"}
                    className="inputField-custom w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="e.g. john@campfire.com"
                  className="inputField-custom w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Bio</label>
                <textarea
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  className="textareaField-custom w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Profile Picture (Avatar)</label>
                <div className="flex items-center gap-4 mt-1.5">
                  {avatarUrl && (
                    <img
                      src={avatarUrl}
                      alt="Avatar Preview"
                      className="w-10 h-10 rounded-full object-cover border border-gray-200"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {uploadingAvatar && <span className="text-xs text-gray-400 animate-pulse">Uploading...</span>}
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as any)}
                    className="selectField-custom w-full cursor-pointer"
                  >
                    <option value="super_admin">Super Admin</option>
                    <option value="editor">Editor</option>
                    <option value="author">Author</option>
                    <option value="reader">Reader</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Account Status</label>
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
                {editingUser ? "Save Account" : "Invite User"}
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;
