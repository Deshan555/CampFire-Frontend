/**
 * Author: Deshan Jayashanka
 */

import React from "react";
import { Link } from "react-router-dom";
import type { Article } from "../../data/articles";
import { LoadingSpinner } from "../canves-animations";

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
      <div className="py-24 text-center">
        <LoadingSpinner message="Syncing with Supabase Ledger..." size="md" />
      </div>
    );
  }

  if (sortedArticles.length === 0) {
    return (
      <div className="py-20 text-center text-neutral-505">
        <i className="fa-solid fa-box-open text-3xl mb-4 text-neutral-300 dark:text-neutral-700"></i>
        <p className="font-serif text-lg italic">No articles found matching this view.</p>
        <button
          onClick={handleOpenCreate}
          className="mt-4 px-5 py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-full hover:opacity-90 cursor-pointer"
        >
          Write Your First Post
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-neutral-50 dark:bg-neutral-900/30 border-b-[0.5px] border-neutral-200 dark:border-neutral-800 text-[10px] uppercase tracking-wider font-extrabold text-neutral-400 dark:text-neutral-500">
            <th className="py-4 px-6">Article Description</th>
            <th className="py-4 px-6">Category</th>
            <th className="py-4 px-6">Status & Attributes</th>
            <th className="py-4 px-6">Engagement</th>
            <th className="py-4 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y-[0.5px] divide-neutral-200 dark:divide-neutral-800">
          {paginatedArticles.map((art) => (
            <tr
              key={art.id}
              className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/10 transition-colors text-sm text-neutral-800 dark:text-neutral-200"
            >
              <td className="py-4 px-6">
                <div className="flex items-center gap-4">
                  {art.image ? (
                    <img
                      src={art.image}
                      alt=""
                      className="w-14 h-10 object-cover rounded-md border-[0.5px] border-neutral-200 dark:border-neutral-800 shrink-0"
                    />
                  ) : art.video ? (
                    <div className="w-14 h-10 bg-neutral-100 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-md flex items-center justify-center shrink-0 text-neutral-500">
                      <i className="fa-solid fa-video text-xs"></i>
                    </div>
                  ) : (
                    <div className="w-14 h-10 bg-neutral-100 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 rounded-md flex items-center justify-center shrink-0 text-neutral-350">
                      <i className="fa-solid fa-newspaper text-xs"></i>
                    </div>
                  )}
                  <div className="min-w-0">
                    <Link
                      to={`/article/${art.id}`}
                      className="font-bold text-neutral-855 dark:text-neutral-50 hover:text-accent-purple dark:hover:text-purple-400 block truncate max-w-sm sm:max-w-md md:max-w-lg text-left"
                    >
                      {art.title}
                    </Link>
                    <span className="text-[10px] text-neutral-450 dark:text-neutral-500 font-medium block mt-1 text-left">
                      Slug: {art.id} • Written by {art.author?.name || "Editorial"} • {art.date}
                    </span>
                    {art.hashtags && art.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1.5 justify-start">
                        {art.hashtags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[9px] text-accent-purple dark:text-purple-400 font-bold bg-accent-purple/5 dark:bg-purple-950/20 border border-accent-purple/20 px-2 py-0.5 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    {art.reviewFeedback && (art.status === "rejected" || art.status === "pending") && (
                      <div className="mt-2 text-left bg-red-500/5 dark:bg-red-950/10 border-[0.5px] border-red-200 dark:border-red-950/30 p-3 rounded-lg text-xs leading-relaxed max-w-xl whitespace-normal">
                        <div className="flex items-center gap-1.5 font-bold text-red-750 dark:text-red-400 mb-1">
                          <i className="fa-solid fa-circle-exclamation text-xs"></i>
                          <span>Editorial Decline Feedback:</span>
                        </div>
                        <div className="text-neutral-705 dark:text-neutral-350 font-mono text-[11px] whitespace-pre-wrap">
                          {art.reviewFeedback}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </td>

              <td className="py-4 px-6 whitespace-nowrap">
                <div className="flex flex-col gap-1 align-baseline items-start">
                  <span className="text-[10px] bg-neutral-100 dark:bg-neutral-900 border-[0.5px] border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-300 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                    {art.category}
                  </span>
                  {art.subcategory && (
                    <span className="text-[9px] text-neutral-400 dark:text-neutral-500 font-bold pl-1 uppercase tracking-wide">
                      ↳ {art.subcategory}
                    </span>
                  )}
                </div>
              </td>

              <td className="py-4 px-6 whitespace-nowrap">
                <div className="flex flex-col gap-1.5 justify-center">
                  <div>
                    {art.status === "approved" ? (
                      <span className="text-[9px] bg-emerald-500/10 border-[0.5px] border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
                        Approved
                      </span>
                    ) : art.status === "rejected" ? (
                      <span className="text-[9px] bg-red-500/10 border-[0.5px] border-red-500/30 text-red-650 dark:text-red-400 px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
                        Rejected
                      </span>
                    ) : (
                      <span className="text-[9px] bg-amber-500/10 border-[0.5px] border-amber-500/30 text-amber-600 dark:text-amber-405 px-2.5 py-0.5 rounded font-extrabold uppercase tracking-wider">
                        Pending review
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {art.featured && (
                      <span className="text-[8px] bg-violet-500/15 border-[0.5px] border-violet-500/30 text-violet-650 dark:text-violet-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Featured
                      </span>
                    )}
                    {art.trending && (
                      <span className="text-[8px] bg-amber-500/15 border-[0.5px] border-amber-500/30 text-amber-650 dark:text-amber-400 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Trending
                      </span>
                    )}
                  </div>
                  {art.targetCountries && art.targetCountries.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {art.targetCountries.map((c) => (
                        <span key={c} className="text-[8px] bg-sky-500/10 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 border-[0.5px] border-sky-500/30 dark:border-sky-900 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          📍 {c}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </td>

              <td className="py-4 px-6 whitespace-nowrap">
                <div className="text-xs space-y-0.5">
                  <div className="text-neutral-600 dark:text-neutral-350 font-medium">
                    Likes: <span className="font-bold text-neutral-850 dark:text-white">{art.likes || 0}</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    Est: {art.readingTime}
                  </div>
                </div>
              </td>

              <td className="py-4 px-6 whitespace-nowrap text-right text-xs">
                <div className="flex items-center justify-end gap-2.5">
                  {(currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "EDITOR") &&
                    art.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleOpenReview(art)}
                          className="w-8 h-8 rounded-full border-[0.5px] border-purple-200 hover:bg-purple-50 dark:border-purple-950/40 dark:hover:bg-purple-950/20 text-accent-purple transition-colors flex items-center justify-center cursor-pointer"
                          title="Agentic AI Review"
                        >
                          <i className="fa-solid fa-robot text-xs"></i>
                        </button>
                        <button
                          onClick={() => handleApprove(art.id)}
                          className="w-8 h-8 rounded-full border-[0.5px] border-emerald-200 hover:bg-emerald-50 dark:border-emerald-950/40 dark:hover:bg-emerald-950/20 text-emerald-600 transition-colors flex items-center justify-center cursor-pointer"
                          title="Approve & Publish (Manual)"
                        >
                          <i className="fa-solid fa-check text-xs"></i>
                        </button>
                        <button
                          onClick={() => handleReject(art.id)}
                          className="w-8 h-8 rounded-full border-[0.5px] border-red-200 hover:bg-red-50 dark:border-red-950/40 dark:hover:bg-red-950/20 text-red-655 transition-colors flex items-center justify-center cursor-pointer"
                          title="Reject Submission (Manual)"
                        >
                          <i className="fa-solid fa-xmark text-xs"></i>
                        </button>
                      </>
                    )}

                  <button
                    onClick={() => handleOpenEdit(art)}
                    className="w-8 h-8 rounded-full border-[0.5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 transition-colors flex items-center justify-center cursor-pointer"
                    title="Edit publication"
                  >
                    <i className="fa-solid fa-pen text-[11px]"></i>
                  </button>
                  <button
                    onClick={() => handleDelete(art.id)}
                    className="w-8 h-8 rounded-full border-[0.5px] border-red-100 dark:border-red-950/40 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 transition-colors flex items-center justify-center cursor-pointer"
                    title="Delete publication"
                  >
                    <i className="fa-solid fa-trash-can text-[11px]"></i>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CrmTable;
