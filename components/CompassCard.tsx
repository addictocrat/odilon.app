"use client";

import React from "react";
import {
  Compass,
  Bookmark,
  Trash2,
  Link as LinkIcon,
  Calendar,
  User,
  Tag,
  Pencil,
} from "lucide-react";
import { CompassContent } from "@/lib/db/schema";
import { useDeleteCompassContent } from "@/hooks/queries/useCompass";
import { AddContentModal } from "./AddContentModal";

interface ContentCardProps {
  content: CompassContent;
  showDelete?: boolean;
  onSave?: (rec: any) => void;
  isRecommendation?: boolean;
  isSaved?: boolean;
}

export function ContentCard({
  content,
  showDelete,
  onSave,
  isRecommendation,
  isSaved,
}: ContentCardProps) {
  const deleteMutation = useDeleteCompassContent();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);

  const handleDelete = async () => {
    if (confirm("Are you sure you want to remove this from your favorites?")) {
      try {
        await deleteMutation.mutateAsync(content.id);
      } catch (err) {
        // Error handling handled by mutation hook (rollback)
      }
    }
  };

  return (
    <div className="bg-odilon-card border border-odilon-logo/10 p-3 rounded-sm shadow-sm space-y-4 hover:shadow-md transition-all relative group h-full flex flex-col">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-odilon-accent/20 text-odilon-logo text-[10px] uppercase tracking-widest font-header rounded-full">
            {content.type}
          </span>
          {content.link && (
            <a
              href={content.link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-7 h-7 flex items-center justify-center rounded-full bg-odilon-logo/5 text-odilon-logo/40 hover:text-odilon-logo hover:bg-odilon-logo/10 transition-all"
              title="View Content"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </a>
          )}
          {isRecommendation && onSave && (
            <button
              onClick={() => !isSaved && onSave(content)}
              disabled={isSaved}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all ${
                isSaved
                  ? "bg-odilon-accent text-odilon-logo cursor-default"
                  : "bg-odilon-logo/5 text-odilon-logo/40 hover:text-odilon-logo hover:bg-odilon-logo/10 cursor-pointer"
              }`}
              title={isSaved ? "Saved to Universe" : "Save to Universe"}
            >
              <Bookmark
                className={`w-3.5 h-3.5 ${isSaved ? "fill-current" : ""}`}
              />
            </button>
          )}
        </div>
        <div className="flex gap-1">
          {showDelete && (
            <>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-odilon-logo/5 text-odilon-logo/30 hover:text-odilon-logo hover:bg-odilon-logo/10 transition-all cursor-pointer"
                title="Edit content"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleDelete}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500/5 text-odilon-logo/30 hover:text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                title="Remove from favorites"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {showDelete && (
        <AddContentModal
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          initialData={content}
        />
      )}

      <div className="space-y-1">
        <h3 className="font-header text-xl text-odilon-logo leading-tight">
          {content.title}
        </h3>
        {content.creator && (
          <div className="flex items-center gap-1.5 text-odilon-logo/60 text-sm">
            <User className="w-3.5 h-3.5" />
            <span className="font-body">{content.creator}</span>
          </div>
        )}
        {content.year && (
          <div className="flex items-center gap-1.5 text-odilon-logo/60 text-sm">
            <Calendar className="w-3.5 h-3.5" />
            <span className="font-body">{content.year}</span>
          </div>
        )}
      </div>

      {content.description && (
        <p className="text-odilon-logo/80 text-sm font-body line-clamp-3">
          {content.description}
        </p>
      )}

      {content.why && (
        <div className="px-3 bg-odilon-background/50 border-l-2 border-odilon-accent/40 text-xs italic text-odilon-logo/70 font-body">
          {content.why}
        </div>
      )}

      <div className="mt-auto pt-4 flex flex-wrap gap-2">
        {((content.tags as string[]) || []).map((tag, i) => (
          <span
            key={i}
            className="flex items-center gap-1 text-[10px] text-odilon-logo/50 font-header uppercase tracking-tighter"
          >
            <Tag className="w-2.5 h-2.5" />
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
