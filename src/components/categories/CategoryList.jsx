import React from "react";
import { Link } from "react-router-dom";
import {
  Film,
  Radio,
  Music,
  Gamepad2,
  Trophy,
  Sparkles,
  Heart,
  Laugh,
  Tv,
  Globe,
  Star,
  Users,
} from "lucide-react";

const categories = [
  {
    id: "movies",
    name: "Movies",
    description: "Blockbusters, classics and new releases",
    icon: Film,
    color: "from-red-500/20 to-red-900/10",
  },
  {
    id: "live",
    name: "Live",
    description: "Watch live streams happening now",
    icon: Radio,
    color: "from-purple-500/20 to-purple-900/10",
  },
  {
    id: "music",
    name: "Music",
    description: "Music videos, concerts and performances",
    icon: Music,
    color: "from-pink-500/20 to-pink-900/10",
  },
  {
    id: "gaming",
    name: "Gaming",
    description: "Gaming streams, tournaments and highlights",
    icon: Gamepad2,
    color: "from-blue-500/20 to-blue-900/10",
  },
  {
    id: "sports",
    name: "Sports",
    description: "Sports streams, events and highlights",
    icon: Trophy,
    color: "from-green-500/20 to-green-900/10",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    description: "Shows, celebrities and trending content",
    icon: Sparkles,
    color: "from-yellow-500/20 to-yellow-900/10",
  },
  {
    id: "romance",
    name: "Romance",
    description: "Romantic movies and series",
    icon: Heart,
    color: "from-rose-500/20 to-rose-900/10",
  },
  {
    id: "comedy",
    name: "Comedy",
    description: "Laughs, comedy shows and funny content",
    icon: Laugh,
    color: "from-orange-500/20 to-orange-900/10",
  },
  {
    id: "series",
    name: "Series",
    description: "Popular series and episodic content",
    icon: Tv,
    color: "from-cyan-500/20 to-cyan-900/10",
  },
  {
    id: "documentary",
    name: "Documentary",
    description: "Real stories, discoveries and experiences",
    icon: Globe,
    color: "from-teal-500/20 to-teal-900/10",
  },
  {
    id: "featured",
    name: "Featured",
    description: "Editor's picks and popular content",
    icon: Star,
    color: "from-indigo-500/20 to-indigo-900/10",
  },
  {
    id: "community",
    name: "Community",
    description: "Creators and community streams",
    icon: Users,
    color: "from-violet-500/20 to-violet-900/10",
  },
];

const CategoryList = ({ limit }) => {
  const visibleCategories = limit
    ? categories.slice(0, limit)
    : categories;

  return (
    <section className="w-full">

      {/* Header */}
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            Browse Categories
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Find something you'll love to watch.
          </p>
        </div>

        {limit && categories.length > limit && (
          <Link
            to="/categories"
            className="shrink-0 text-sm font-medium text-red-500 transition hover:text-red-400"
          >
            View all
          </Link>
        )}
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {visibleCategories.map((category) => {
          const Icon = category.icon;

          return (
            <Link
              key={category.id}
              to={`/categories/${category.id}`}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-[#141416] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-[#19191c]"
            >
              {/* Background Glow */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-60 transition-opacity duration-300 group-hover:opacity-100`}
              />

              {/* Content */}
              <div className="relative z-10">

                {/* Icon */}
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] text-gray-300 transition-all duration-300 group-hover:bg-red-500/10 group-hover:text-red-400">
                  <Icon size={22} strokeWidth={1.8} />
                </div>

                {/* Name */}
                <h3 className="text-sm font-semibold text-white">
                  {category.name}
                </h3>

                {/* Description */}
                <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-gray-500">
                  {category.description}
                </p>

              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryList;