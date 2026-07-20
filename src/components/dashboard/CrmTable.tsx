/**
 * Author: Deshan Jayashanka
 */

import React from "react";
import { Link } from "react-router-dom";
import { ArticleStatus, type Article } from "../../data/articles";
import { LoadingScreen } from "../common/LoadingScreen";
import { NoDataScreen } from "../common/NoDataScreen";
import { Bot, CalendarDays, Check, CircleAlert, Clock3, FileText, Pencil, Trash2, Video, X } from "lucide-react";

interface CrmTableProps {
  currentUser: any;
  loading: boolean;
  sortedArticles: Article[];
  paginatedArticles: Article[];
  handleOpenReview: (art: Article) => void;
  handleApprove: (id: string) => void;
  handleReject: (id: string) => void;
  handleOpenEdit: (art: Article) => void;
  handleDelete: (id: string) => void;
  handleOpenCreate: () => void;
}

export const CrmTable: React.FC<CrmTableProps> = ({
  currentUser,
  loading,
  sortedArticles,
  paginatedArticles,
  handleOpenReview,
  handleApprove,
  handleReject,
  handleOpenEdit,
  handleDelete,
  handleOpenCreate,
}) => {
  if (loading) {
    return (
      <LoadingScreen message="Syncing with Supabase Ledger..." />
    );
  }

  if (sortedArticles.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center text-center text-neutral-505">
        <NoDataScreen message="No articles found matching this view." />
        <button
          onClick={handleOpenCreate}
          className="mt-4 px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-full hover:opacity-90 cursor-pointer"
        >
          Write Your First Post
        </button>
      </div>
    );
  }

  const getStatusMeta = (status?: ArticleStatus) => {
    if (status === ArticleStatus.APPROVED) {
      return { label: "Approved", className: "is-approved" };
    }
    if (status === ArticleStatus.REJECTED) {
      return { label: "Rejected", className: "is-rejected" };
    }
    return { label: "In review", className: "is-pending" };
  };

  const userRole = String(currentUser?.role || "").toUpperCase();
  const canModerate = userRole === "SUPER_ADMIN" || userRole === "EDITOR";

  return (
    <div className="crm-table-shell">
      <table className="crm-table">
        <thead>
          <tr>
            <th>Publication</th>
            <th>Section</th>
            <th>Status</th>
            <th>Updated</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedArticles.map((art) => {
            const statusMeta = getStatusMeta(art.status);

            return (
              <tr key={art.id}>
                <td>
                  <div className="crm-publication-cell">
                    <div className="crm-publication-thumb">
                      {art.image ? (
                        <img src={art.image} alt="" />
                      ) : art.video ? (
                        <Video size={17} />
                      ) : (
                        <FileText size={17} />
                      )}
                      {art.video && <span className="crm-media-badge"><Video size={10} /></span>}
                    </div>

                    <div className="crm-publication-copy">
                      <Link to={`/article/${art.id}`}>{art.title}</Link>
                      <p>{art.summary || "No summary provided."}</p>
                      <div className="crm-publication-meta">
                        <span>{art.author?.name || "Editorial"}</span>
                        <span><Clock3 size={12} /> {art.readingTime}</span>
                      </div>
                    </div>
                  </div>
                </td>

                <td>
                  <div className="crm-section-cell">
                    <span>{art.category}</span>
                    {art.subcategory && (
                      <small>{art.subcategory}</small>
                    )}
                  </div>
                </td>

                <td>
                  <div className="crm-status-cell">
                    <span className={`crm-status-pill ${statusMeta.className}`}>{statusMeta.label}</span>
                    {art.reviewFeedback && (
                      <span className="crm-feedback-note" title={art.reviewFeedback}>
                        <CircleAlert size={12} />
                        Feedback
                      </span>
                    )}
                  </div>
                </td>

                <td>
                  <div className="crm-date-cell">
                    <CalendarDays size={14} />
                    <span>{art.date}</span>
                  </div>
                </td>

                <td>
                  <div className="crm-action-group">
                    {canModerate && art.status === ArticleStatus.PENDING_REVIEW && (
                      <>
                        <button
                          onClick={() => handleOpenReview(art)}
                          className="admin-action-btn primary"
                          title="AI review"
                        >
                          <Bot size={14} />
                        </button>
                        <button
                          onClick={() => handleApprove(art.id)}
                          className="admin-action-btn primary-light"
                          title="Approve"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={() => handleReject(art.id)}
                          className="admin-action-btn delete"
                          title="Reject"
                        >
                          <X size={14} />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => handleOpenEdit(art)}
                      className="admin-action-btn edit"
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(art.id)}
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
    </div>
  );
};

export default CrmTable;
