import React from "react";
import { ChevronDown } from "lucide-react";

interface BlogToolbarProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const BlogToolbar: React.FC<BlogToolbarProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <div className="w-full flex flex-col md:flex-row justify-between items-center py-6 border-b border-gray-200 mb-8 gap-4">
      {/* Left: Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === category
                ? "bg-gray-100 text-black"
                : "bg-transparent text-gray-800 hover:bg-gray-50"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Right: Sort */}
      <div className="flex items-center gap-3 self-start md:self-auto w-full md:w-auto">
        <div className="relative">
          <button className="flex items-center gap-1.5 px-2 py-1 bg-transparent text-xs text-gray-500 hover:text-black transition-colors">
            Sort by: <span className="text-black font-semibold">Newest</span>
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogToolbar;
