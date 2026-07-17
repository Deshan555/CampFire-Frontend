import React, { useState } from "react";
import { Users, FileText, CheckCircle, TrendingUp, Tags, RefreshCw, LayoutDashboard } from "lucide-react";
import { Pagination } from "../common/Pagination";
import { AdminHeader } from "./AdminHeader";

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
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            <div className="p-5 bg-gray-50/50 border border-gray-200 rounded-2xl flex flex-col justify-between h-28 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 font-semibold text-xs">
                <span>Total Users</span>
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Users size={14} /></div>
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-black text-gray-900">1,248</span>
                <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5"><TrendingUp size={10} /> +12%</span>
              </div>
            </div>

            <div className="p-5 bg-gray-50/50 border border-gray-200 rounded-2xl flex flex-col justify-between h-28 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 font-semibold text-xs">
                <span>Total Articles</span>
                <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><FileText size={14} /></div>
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-black text-gray-900">342</span>
                <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5"><TrendingUp size={10} /> +5%</span>
              </div>
            </div>

            <div className="p-5 bg-gray-50/50 border border-gray-200 rounded-2xl flex flex-col justify-between h-28 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 font-semibold text-xs">
                <span>Pending Review</span>
                <div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg"><CheckCircle size={14} /></div>
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-black text-gray-900">12</span>
                <span className="text-[10px] text-gray-400 font-bold">Needs approval</span>
              </div>
            </div>

            <div className="p-5 bg-[#0B0D14] border border-[#1B2230] rounded-2xl flex flex-col justify-between h-28 shadow-sm text-white">
              <div className="flex items-center justify-between text-gray-400 font-semibold text-xs">
                <span>Active Tags</span>
                <div className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg"><Tags size={14} /></div>
              </div>
              <div className="flex items-baseline gap-1.5 mt-2">
                <span className="text-2xl font-black text-white">156</span>
                <span className="text-[10px] text-blue-400 font-bold">Globally used</span>
              </div>
            </div>

          </div>
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
