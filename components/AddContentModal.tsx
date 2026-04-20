"use client";

import React, { useState } from "react";
import { Plus, X, Search, Loader2, Pencil } from "lucide-react";
import {
  useSaveCompassContent,
  useUpdateCompassContent,
} from "@/hooks/queries/useCompass";
import { toast } from "sonner";
import { CompassContent } from "@/lib/db/schema";

const CONTENT_TYPES = [
  "Book",
  "Movie",
  "TV Show",
  "Podcast",
  "Music",
  "Game",
  "Article",
  "YouTube",
];

interface AddContentModalProps {
  onAdded?: () => void;
  initialData?: CompassContent;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function AddContentModal({
  onAdded,
  initialData,
  isOpen: externalIsOpen,
  onOpenChange,
  trigger,
}: AddContentModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen =
    externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = onOpenChange || setInternalIsOpen;

  const saveMutation = useSaveCompassContent();
  const updateMutation = useUpdateCompassContent();

  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = {
      type: formData.get("type") as string,
      title: formData.get("title") as string,
      creator: (formData.get("creator") as string) || undefined,
      year: (formData.get("year") as string) || undefined,
      link: (formData.get("link") as string) || undefined,
      description: (formData.get("description") as string) || undefined,
      why: initialData?.why || undefined,
      tags: initialData?.tags || undefined,
    };

    try {
      if (isEditing && initialData) {
        await updateMutation.mutateAsync({ id: initialData.id, data });
        toast.success(`"${data.title}" updated.`);
      } else {
        await saveMutation.mutateAsync(data);
        toast.success(`"${data.title}" added to your universe.`);
      }
      setIsOpen(false);
      onAdded?.();
    } catch (err) {
      toast.error(
        `Failed to ${isEditing ? "update" : "add"} content. Please try again.`,
      );
    }
  };

  const loading = saveMutation.isPending || updateMutation.isPending;

  if (!isOpen) {
    if (trigger) {
      return (
        <div onClick={() => setIsOpen(true)} className="cursor-pointer">
          {trigger}
        </div>
      );
    }

    // Do not render the default "Add to Favorites" button if we have initialData 
    // (meaning this modal is embedded in a card for editing)
    if (initialData) return null;

    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-6 py-3 bg-odilon-logo text-white text-xs uppercase tracking-widest font-header hover:shadow-lg transition-all active:scale-95 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Add to Favorites
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background">
      <div
        className="bg-odilon-background w-full max-w-lg p-8 rounded-sm shadow-2xl relative border border-odilon-logo/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsOpen(false)}
          className="absolute right-4 top-4 text-odilon-logo/40 hover:text-odilon-logo transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="mb-6">
          <h2 className="font-header text-3xl text-odilon-logo leading-none">
            {isEditing ? "Edit favorite" : "Add to favorites"}
          </h2>
          <p className="font-body text-sm text-odilon-logo/60 mt-2 italic">
            {isEditing
              ? "Update your taste profile."
              : "Add a piece of content that defines your taste."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest font-header text-odilon-logo/40">
                Category
              </label>
              <select
                name="type"
                required
                defaultValue={initialData?.type}
                className="w-full bg-odilon-card border-b border-odilon-logo/20 p-2 font-body text-sm focus:border-odilon-logo focus:outline-none transition-colors"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest font-header text-odilon-logo/40">
                Title
              </label>
              <input
                name="title"
                required
                defaultValue={initialData?.title}
                placeholder="The Masterpiece"
                className="w-full bg-odilon-card border-b border-odilon-logo/20 p-2 font-body text-sm focus:border-odilon-logo focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest font-header text-odilon-logo/40">
                Creator / Author
              </label>
              <input
                name="creator"
                defaultValue={initialData?.creator || ""}
                placeholder="Name"
                className="w-full bg-odilon-card border-b border-odilon-logo/20 p-2 font-body text-sm focus:border-odilon-logo focus:outline-none transition-colors"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[10px] uppercase tracking-widest font-header text-odilon-logo/40">
                Year
              </label>
              <input
                name="year"
                defaultValue={initialData?.year || ""}
                placeholder="2024"
                className="w-full bg-odilon-card border-b border-odilon-logo/20 p-2 font-body text-sm focus:border-odilon-logo focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-widest font-header text-odilon-logo/40">
              Link (Optional)
            </label>
            <input
              name="link"
              defaultValue={initialData?.link || ""}
              placeholder="https://..."
              className="w-full bg-odilon-card border-b border-odilon-logo/20 p-2 font-body text-sm focus:border-odilon-logo focus:outline-none transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[10px] uppercase tracking-widest font-header text-odilon-logo/40">
              Short Description / Why you love it
            </label>
            <textarea
              name="description"
              defaultValue={initialData?.description || ""}
              rows={3}
              className="w-full bg-odilon-card border-b border-odilon-logo/20 p-2 font-body text-sm focus:border-odilon-logo focus:outline-none transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-odilon-logo text-white text-xs uppercase tracking-widest font-header hover:shadow-lg transition-all flex items-center justify-center gap-2 group border border-transparent active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isEditing ? (
              <Pencil className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {isEditing ? "Update Content" : "Add Content"}
          </button>
        </form>
      </div>
    </div>
  );
}
