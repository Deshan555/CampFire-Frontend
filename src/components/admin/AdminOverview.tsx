import React, { useState, useEffect } from "react";
import { LayoutDashboard, RefreshCw } from "lucide-react";
import { Pagination } from "../common/Pagination";
import { AdminHeader } from "./AdminHeader";
import CrmAnalytics from "../dashboard/CrmAnalytics";
import { fetchArticles, fetchRules } from "../../api";

interface AuditLog {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  status: "Success" | "Warning" | "Error";
}

const auditLogs: AuditLog[] = [
  { id: "1092", user: "Alice Admin", action: "Updated AI rule 'Profanity Check'", timestamp: "2 mins ago", status: "Success" },
  { id: "1091", user: "Bob Editor", action: "Approved article 'Hiking in Switzerland'", timestamp: "15 mins ago", status: "Success" },
  { id: "1090", user: "Charlie Author", action: "Created draft 'Hidden Gems of Asia'", timestamp: "1 hour ago", status: "Success" },
  { id: "1089", user: "System Scheduler", action: "Automated review failed (timeout)", timestamp: "2 hours ago", status: "Warning" },
  { id: "1088", user: "Dave Reader", action: "Registered a new account", timestamp: "3 hours ago", status: "Success" },
  { id: "1087", user: "System Guard", action: "Unauthorized access blocked at /admin/settings", timestamp: "5 hours ago", status: "Error" },
];

const AdminOverview: React.FC = () => {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const totalPages = Math.ceil(auditLogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLogs = auditLogs.slice(indexOfFirstItem, indexOfLastItem);

  const [loading, setLoading] = useState(false);
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalLikes, setTotalLikes] = useState(0);
  const [rulesCount, setRulesCount] = useState(0);
  const [activeRulesCount, setActiveRulesCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("editorUser");
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      
      setLoading(true);
      fetchArticles(undefined, { editorMode: true, role: user.role, authorId: user.id })
        .then(data => {
          setTotalArticles(data.length);
          setTotalLikes(data.reduce((sum: number, a: any) => sum + (a.likes || 0), 0));
        })
        .catch(err => console.error("Failed to fetch articles", err))
        .finally(() => setLoading(false));

      if (user.role === "SUPER_ADMIN" || user.role === "EDITOR") {
        fetchRules("11111111-1111-1111-1111-111111111111")
          .then(data => {
            setRulesCount(data.length);
            setActiveRulesCount(data.filter((r: any) => r.is_active).length);
          })
          .catch(err => console.error("Failed to prefetch rules", err));
      }
    }
  }, []);

  return (
    <div className="flex h-full w-full bg-white overflow-hidden text-sm">

      {/* Middle Pane: Stats & Log activity */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-white">

        {/* Sub-Header */}
        <AdminHeader 
          title="System Dashboard"
          icon={LayoutDashboard}
          description="Overall statistics and audit logs for the editorial portal."
        />

        {/* Stats Grid */}
        <div className="px-6 py-6 border-b border-gray-200 shrink-0 bg-white">
          <CrmAnalytics
            currentUser={currentUser}
            loading={loading}
            totalArticles={totalArticles}
            totalLikes={totalLikes}
            rulesCount={rulesCount}
            activeRulesCount={activeRulesCount}
            activeModel="gemma3:1b"
          />
        </div>

        {/* Audit Logs Header */}
        <div className="px-6 py-3.5 border-b border-gray-200 shrink-0 bg-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-800">Recent Security & Audit Logs</h3>
          <button className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-black font-semibold">
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-grow overflow-auto">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-white border-b border-gray-150 text-[10px] uppercase font-bold tracking-wider text-gray-500 select-none">
                <th className="px-6 py-3.5">Log ID</th>
                <th className="px-6 py-3.5">User</th>
                <th className="px-6 py-3.5">Action</th>
                <th className="px-6 py-3.5">Time</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {currentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-[11px] text-gray-500">#{log.id}</td>
                  <td className="px-6 py-4 font-semibold text-gray-900">{log.user}</td>
                  <td className="px-6 py-4 text-gray-600">{log.action}</td>
                  <td className="px-6 py-4 text-gray-500">{log.timestamp}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold border ${log.status === "Success" ? "bg-green-50 text-green-700 border-green-200" :
                      log.status === "Warning" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                        "bg-red-50 text-red-700 border-red-200"
                      }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

    </div>
  );
};

export default AdminOverview;
