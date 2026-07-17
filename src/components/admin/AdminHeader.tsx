import React, { type ReactNode } from "react";
import { Home, ChevronRight, type LucideIcon } from "lucide-react";

interface AdminHeaderProps {
  title: string;
  icon: LucideIcon;
  iconClassName?: string;
  badge?: ReactNode;
  description?: string;
  children?: ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  icon: Icon,
  iconClassName = "text-gray-900",
  badge,
  description,
  children,
}) => {
  return (
    <div className="px-6 py-2 border-b border-gray-200 shrink-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-gray-500 mb-1">
          <Home size={18} />
          <span className="admin-panel-header-second">Home</span>
          <ChevronRight size={16} />
          <Icon size={20} className={iconClassName} />
          <h2 className="admin-panel-header text-gray-900">{title}</h2>
          {badge && (
            <span className="text-xs bg-gray-100 text-gray-500 font-bold px-2 py-0.5 rounded-full ml-2 admin-panel-header-dec">
              {badge}
            </span>
          )}
        </div>
        {description && <p className="admin-panel-header-dec">{description}</p>}
      </div>
      {children && (
        <div className="flex items-center gap-2">
          {children}
        </div>
      )}
    </div>
  );
};
