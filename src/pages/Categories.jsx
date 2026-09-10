import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronRight,
  Film,
  Music,
  Trophy,
  Gamepad2,
  Laugh,
  Heart,
  Globe,
  Sparkles,
  MessageCircle,
  MonitorPlay,
  GraduationCap,
  Newspaper,
} from "lucide-react";

import { useStream } from "../context/StreamContext";

const CATEGORY_ICONS = {
  Gaming: Gamepad2,
  Music: Music,
  Entertainment: Film,
  Sports: Trophy,
  "Just Chatting": MessageCircle,
  Technology: MonitorPlay,
  Education: GraduationCap,
  Comedy: Laugh,
  Lifestyle: Heart,
  News: Newspaper,
  Esports: Sparkles,
};

const CATEGORY_IMAGES = {
  Gaming:
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1000&q=80",
  Music:
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1000&q=80",
  Entertainment:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80",
  Sports:
    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80",
  "Just Chatting":
    "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80",
  Technology:
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80",
  Education:
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80",
  Comedy:
    "https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&w=1000&q=80",
  Lifestyle:
    "https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&w=1000&q=80",
  News:
    "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=1000&q=80",
  Esports:
    "https://images.unsplash.com/photo-1542751110-97427bbecf20?auto=format&fit=crop&w=1000&q=80",
};

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1000&q=80";

const CATEGORY_DESCRIPTIONS = {
  Gaming: "Live gameplay, walkthroughs and pro gaming sessions.",
  Music: "Concerts, DJ sets and live musical performances.",
  Entertainment: "Talk shows, variety and everything in between.",
  Sports: "Live sports, match discussions and analysis.",
  "Just Chatting": "Casual conversations and community hangouts.",
  Technology: "Coding, gadgets and the latest in tech.",
  Education: "Learn new skills with live teachers and creators.",
  Comedy: "Stand-up, sketches and comedic entertainment.",
  Lifestyle: "Fashion, food, travel and everyday living.",
  News: "Live news coverage and current events.",
  Esports: "Competitive tournaments and pro esports action.",
};

const Categories = () => {
  const navigate = useNavigate();
  const { categories, loadCategories, loading } = useStream();
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadCategories().catch(() => {});
  }, [loadCategories]);

  const cards = useMemo(() => {
    const list =
      categories && categories.length > 0
        ? categories
        : [
            { name: "Gaming" },
            { name: "Music" },
            { name: "Entertainment" },
            { name: "Sports" },
            { name: "Just Chatting" },
            { name: "Technology" },
            { name: "Education" },
            { name: "Comedy" },
            { name: "Lifestyle" },
            { name: "News" },
            { name: "Esports" },
          ];

    const value = search.toLowerCase().trim();

    return list
      .map((raw) => ({
        id:
          raw.id ||
          (raw.name || "").toLowerCase().replace(/\s+/g, "-"),
        name: raw.name || "Other",
        count:
          (raw.liveCount || 0) > 0
            ? `${raw.liveCount} live`
            : `${raw.streamCount || 0} ${(raw.streamCount || 0) === 1 ? "stream" : "streams"}`,
        viewers: raw.viewers || 0,
        description:
          CATEGORY_DESCRIPTIONS[raw.name] ||
          "Live content and conversations in this category.",
        icon: CATEGORY_ICONS[raw.name] || Globe,
        image: CATEGORY_IMAGES[raw.name] || FALLBACK_IMAGE,
      }))
      .filter(
        (category) =>
          !value ||
          category.name.toLowerCase().includes(value) ||
          category.description.toLowerCase().includes(value)
      );
  }, [categories, search]);

  const openCategory = (name) => {
    navigate(`/browse?category=${encodeURIComponent(name)}`);
  };

  return (
    <div className="min-h-screen bg-[#0f0f10] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className="mb-10">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-red-500">
                Streamora
              </p>

              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Categories
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
                Browse live streams by category — gaming, music, sports,
                technology and more.
              </p>
            </div>

            <div className="relative w-full md:w-80">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Find a category..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-red-500/50 focus:bg-white/[0.06]"
              />
            </div>
          </div>
        </section>

        {loading && (!categories || categories.length === 0) ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-72 animate-pulse rounded-2xl bg-white/[0.04]"
              />
            ))}
          </div>
        ) : cards.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {cards.map((category) => {
              const Icon = category.icon;

              return (
                <article
                  key={category.id}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#171719] transition duration-300 hover:-translate-y-1 hover:border-white/20"
                >
                  <button
                    type="button"
                    onClick={() => openCategory(category.name)}
                    className="block w-full text-left"
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                      />

                      <div className="absolute inset-0 bg-gradient-to-t from-[#171719] via-black/20 to-transparent" />

                      <div className="absolute left-4 top-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black/50 text-white backdrop-blur-md">
                        <Icon size={24} />
                      </div>

                      <span className="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-gray-200 backdrop-blur-md">
                        {category.count}
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold">
                          {category.name}
                        </h2>

                        <ChevronRight
                          size={19}
                          className="text-gray-500 transition duration-300 group-hover:translate-x-1 group-hover:text-white"
                        />
                      </div>

                      <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-500">
                        {category.description}
                      </p>
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-20 text-center">
            <Search size={32} className="mx-auto mb-4 text-gray-600" />

            <h2 className="text-lg font-semibold">No categories found</h2>

            <p className="mt-2 text-sm text-gray-500">
              Try searching for another category.
            </p>
          </div>
        )}

        <section className="mt-12 rounded-2xl border border-white/10 bg-gradient-to-r from-red-950/40 to-[#171719] p-6 sm:p-8">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-medium text-red-500">
                DISCOVER MORE
              </p>

              <h2 className="mt-2 text-xl font-bold sm:text-2xl">
                There is always something to watch.
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Explore live streams and find your next favorite creator.
              </p>
            </div>

            <button
              onClick={() => navigate("/browse")}
              className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-6 py-3 text-sm font-semibold transition hover:bg-red-700"
            >
              Browse Streams
              <ChevronRight size={17} />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Categories;