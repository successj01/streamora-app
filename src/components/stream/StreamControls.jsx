import React from "react";
import { Heart, Share2, Bookmark, MoreHorizontal } from "lucide-react";

const StreamControls = ({
  liked = false,
  saved = false,
  likeCount = 0,
  onLike,
  onSave,
  onShare,
  onMore,
}) => {
  return (
    <div className="flex items-center justify-between border-b border-white/10 py-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onLike}
          aria-label={liked ? "Unlike stream" : "Like stream"}
          className={`flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition ${
            liked
              ? "bg-red-500/10 text-red-500"
              : "text-gray-400 hover:bg-white/[0.05] hover:text-white"
          }`}
        >
          <Heart size={18} fill={liked ? "currentColor" : "none"} />

          {likeCount > 0 ? (
            <span>{likeCount.toLocaleString()}</span>
          ) : (
            <span>Like</span>
          )}
        </button>

        <button
          type="button"
          onClick={onSave}
          aria-label={saved ? "Remove from saved" : "Save stream"}
          className={`flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium transition ${
            saved
              ? "bg-white/10 text-white"
              : "text-gray-400 hover:bg-white/[0.05] hover:text-white"
          }`}
        >
          <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
          Save
        </button>

        <button
          type="button"
          onClick={onShare}
          className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm font-medium text-gray-400 transition hover:bg-white/[0.05] hover:text-white"
        >
          <Share2 size={18} />
          Share
        </button>
      </div>

      <button
        type="button"
        onClick={onMore}
        aria-label="More options"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-400 transition hover:bg-white/[0.05] hover:text-white"
      >
        <MoreHorizontal size={19} />
      </button>
    </div>
  );
};

export default StreamControls;