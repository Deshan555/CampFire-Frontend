import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

interface CrmHeaderProps {
  currentUser: any;
  handleOpenRules: () => void;
  handleOpenCreate: () => void;
}

export const CrmHeader: React.FC<CrmHeaderProps> = ({
  currentUser,
  handleOpenRules,
  handleOpenCreate,
}) => {
  const [locationDetails, setLocationDetails] = useState<any>(null);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.country_name) {
          setLocationDetails({
            country: data.country_name,
            city: data.city,
            ip: data.ip
          });
        }
      })
      .catch((e) => console.error("Failed to fetch location info:", e));
  }, []);

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Link
            to="/"
            className="text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:text-neutral-455 dark:hover:text-neutral-100 transition-colors flex items-center gap-1.5"
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>Back to Magazine</span>
          </Link>
        </div>
        <h1 className="font-serif text-3xl font-black text-neutral-900 dark:text-neutral-55">
          CRM Editorial Board
        </h1>
        <p className="text-xs text-neutral-400 dark:text-neutral-550 mt-1 font-medium flex items-center gap-3 flex-wrap">
          <span>
            {currentUser?.role === "SUPER_ADMIN"
              ? "Super Admin Dashboard - Oversee all submissions, review draft requests, and publish editorial features."
              : `Author Panel - Hello, ${currentUser?.name}. Manage your contributions and draft write-ups.`}
          </span>
          {locationDetails && (
            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full border border-emerald-250 dark:border-emerald-900 text-emerald-850 dark:text-emerald-400 text-[10px] font-bold">
              <i className="fa-solid fa-location-dot text-[9px]"></i>
              <span>Session: {locationDetails.city}, {locationDetails.country}</span>
            </span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-3">
        {(currentUser?.role === "SUPER_ADMIN" || currentUser?.role === "EDITOR") && (
          <button
            onClick={handleOpenRules}
            className="px-4 py-2.5 border-[0.5px] border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 text-neutral-800 dark:text-neutral-200 text-xs font-bold rounded-full transition-all flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <i className="fa-solid fa-robot text-[10px] text-accent-purple"></i>
            <span>AI Review Rules</span>
          </button>
        )}

        <button
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-955 text-xs font-bold rounded-full transition-all hover:opacity-90 flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <i className="fa-solid fa-pen-nib text-[10px]"></i>
          <span>Write Article</span>
        </button>
      </div>
    </div>
  );
};

export default CrmHeader;
