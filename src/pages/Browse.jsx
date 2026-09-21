import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search, Play, Pause, SlidersHorizontal, Radio, Music2 } from "lucide-react";

import StreamCard from "../components/stream/StreamCard";
import { useStream } from "../context/StreamContext";
import { STREAM_CATEGORIES } from "../utils/constants";

const songs = [
  {
    id: "19-baba-reprise",
    title: "19 Baba Reprise",
    artist: "Unknown Artist",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/19 Baba Reprise-1.mp3",
  },
  {
    id: "ab-ecclesiatiscal-jarasis",
    title: "AB Ecclesiatiscal Jarasis",
    artist: "Unknown Artist",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/ab ecclesiatiscal jarasis(01).mp3",
  },
  {
    id: "again-o",
    title: "Again O",
    artist: "DJ 4kerty ft Zlatan, Ola Dips",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/DJ-4kerty-ft-Zlatan-X-Ola-Dips-\u2013-Again-O.mp3",
  },
  {
    id: "amaka",
    title: "Amaka",
    artist: "2Baba ft Peruzzi",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/amaka-2baba-peruzzi.mp3",
  },
  {
    id: "ayaka-ozubulu-1",
    title: "Ayaka Ozubulu (1)",
    artist: "Unknown Artist",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/AYAKA OZUBULU (1).mp3",
  },
  {
    id: "ayaka-ozubulu-2",
    title: "Ayaka Ozubulu (2)",
    artist: "Unknown Artist",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/AYAKA OZUBULU (2).mp3",
  },
  {
    id: "ayaka-ozubulu-3",
    title: "Ayaka Ozubulu (3)",
    artist: "Unknown Artist",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/AYAKA OZUBULU (3).mp3",
  },
  {
    id: "ayaka-ozubulu-4",
    title: "Ayaka Ozubulu (4)",
    artist: "Unknown Artist",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/AYAKA OZUBULU (4).mp3",
  },
  {
    id: "ayaka-ozubulu-5",
    title: "Ayaka Ozubulu (5)",
    artist: "Unknown Artist",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/AYAKA OZUBULU (5).mp3",
  },
  {
    id: "baddest-boy-remix",
    title: "Baddest Boy Remix",
    artist: "Davido ft Skiibii",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Davido-Ft-Skiibii-Baddest-Boy-Remix-New-Song-(TrendyBeatz.com).mp3",
  },
  {
    id: "blow-my-mind",
    title: "Blow My Mind",
    artist: "Davido ft Chris Brown",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Davido-Ft.-Chris-Brown-\u2013-Blow-My-Mind.mp3",
  },
  {
    id: "come-go",
    title: "Come Go",
    artist: "ArrDee",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/ArrDee_Come_Go_(thinkNews.com.ng).mp3",
  },
  {
    id: "dangote",
    title: "Dangote",
    artist: "Burna Boy",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Burna_Boy_Dangote_9jaflaver.com_.mp3",
  },
  {
    id: "dey-ur-dey",
    title: "Dey Ur Dey",
    artist: "Lit Vybez ft Zlatan",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Dey-ur-Dey_by_Lit-Vybez-ft.-Zlatan.mp3",
  },
  {
    id: "golibe",
    title: "Golibe",
    artist: "Flavour",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Flavour-Golibe-(JustNaija.com).mp3",
  },
  {
    id: "high-way",
    title: "High Way",
    artist: "DJ Kaywise ft Phyno",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/DJ-Kaywise-High-Way-ft-Phyno-(JustNaija.com).mp3",
  },
  {
    id: "jowo",
    title: "Jowo",
    artist: "Davido",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Davido-Jowo.mp3",
  },
  {
    id: "killin-dem",
    title: "Killin Dem",
    artist: "Burna Boy ft Zlatan",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Burna_Boy_Ft_Zlatan_Killin_Dem_9jaflaver.com_-1.mp3",
  },
  {
    id: "kwaku-the-traveller",
    title: "Kwaku The Traveller",
    artist: "Black Sherif",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Black-Sherif-Kwaku-The-Traveller-New-Song-(TrendyBeatz.com).mp3",
  },
  {
    id: "la-la",
    title: "La La",
    artist: "Davido ft CKay",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Davido-La-La-ft.-CKay.mp3",
  },
  {
    id: "last-last",
    title: "Last Last",
    artist: "Burna Boy",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Burna-Boy-Last-Last-New-Song-(TrendyBeatz.com).mp3",
  },
  {
    id: "mans-not-hot",
    title: "Mans Not Hot",
    artist: "Big Shaq",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Big-Shaq-Mans-Not-Hot.mp3",
  },
  {
    id: "mega-mix-11",
    title: "Mega Mix 11",
    artist: "DJ",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/dj mega mix 11 07052739261.mp3.mp3",
  },
  {
    id: "mercy-acoustic",
    title: "Mercy Acoustic",
    artist: "Flavour & Semah",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Flavour_And_Semah_Mercy_Acoustic_9jaflaver.com_.mp3",
  },
  {
    id: "omo-ope",
    title: "Omo Ope",
    artist: "Asake ft Olamide",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Asake_Olamide_-_Omo_Ope.mp3",
  },
  {
    id: "on-the-low",
    title: "On The Low",
    artist: "Burna Boy",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Burna_Boy_On_The_Low_9jaflaver.com_.mp3",
  },
  {
    id: "peace-be-unto-you",
    title: "Peace Be Unto You",
    artist: "Asake",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Asake_-_Peace_Be_Unto_You.mp3",
  },
  {
    id: "philo",
    title: "Philo",
    artist: "Bella Shmurda ft Omah Lay",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Bella-Shmurda-Ft-Omah-Lay-Philo-(TrendyBeatz.com).mp3",
  },
  {
    id: "pronto",
    title: "Pronto",
    artist: "Ajebo Hustlers ft Omah Lay",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Ajebo_Hustlers_-_Pronto_ft_Omah_Lay.mp3",
  },
  {
    id: "risky",
    title: "Risky",
    artist: "Davido ft Popcaan",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Davido_Ft_Popcaan-_Risky_Via__9jaflaver.com_(5).mp3",
  },
  {
    id: "terminator",
    title: "Terminator",
    artist: "Asake",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Asake_-_Terminator.mp3",
  },
  {
    id: "the-best",
    title: "The Best",
    artist: "Davido ft Mayorkun",
    category: "Afrobeat",
    audioUrl: "/music/afrobeat/Davido-The-Best-ft.-Mayorkun-1.mp3",
  },
];

const Browse = () => {
  const { streams, liveStreams, loadStreams, loading } = useStream();
  const [searchParams, setSearchParams] = useSearchParams();

  const urlCategory = searchParams.get("category");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (urlCategory && urlCategory !== "All") {
      setActiveCategory(urlCategory);
    } else {
      setActiveCategory("All");
    }
  }, [urlCategory]);

  useEffect(() => {
    loadStreams().catch(() => {});
  }, [loadStreams]);

  const selectCategory = (category) => {
    setActiveCategory(category);

    if (category === "All") {
      setSearchParams({});
    } else {
      setSearchParams({ category });
    }
  };

  const featured = useMemo(() => {
    if (liveStreams.length > 0) return liveStreams[0];
    return streams[0] || null;
  }, [streams, liveStreams]);

  const filteredStreams = useMemo(() => {
    const value = search.toLowerCase().trim();

    return streams.filter((stream) => {
      const matchesCategory =
        activeCategory === "All" || stream.category === activeCategory;

      const matchesSearch =
        !value ||
        stream.title.toLowerCase().includes(value) ||
        stream.category.toLowerCase().includes(value) ||
        (stream.creator || "").toLowerCase().includes(value);

      return matchesCategory && matchesSearch;
    });
  }, [streams, activeCategory, search]);

  const categories = ["All", ...STREAM_CATEGORIES];

  return (
    <div className="min-h-screen bg-[#0f0f10] px-4 py-8 text-white sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-red-500">STREAMORA</p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Discover
            </h1>

            <p className="mt-2 max-w-xl text-sm text-gray-400 sm:text-base">
              Explore live streams and replays picked for you.
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />

            <input
              type="text"
              placeholder="Search streams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-red-500/50"
            />
          </div>
        </div>

        <div className="mb-8 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <SlidersHorizontal size={18} className="mr-1 shrink-0 text-gray-400" />

          {categories.map((category) => (
            <button
              key={category}
              onClick={() => selectCategory(category)}
              className={`whitespace-nowrap rounded-full px-5 py-2.5 text-sm font-medium transition ${
                activeCategory === category
                  ? "bg-red-600 text-white"
                  : "bg-white/[0.05] text-gray-400 hover:bg-white/[0.09] hover:text-white"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {featured && !search && activeCategory === "All" && (
          <Link
            to={`/stream/${featured.id}`}
            className="group relative mb-12 block overflow-hidden rounded-2xl border border-white/10 bg-[#171719]"
          >
            <div className="relative h-[320px] sm:h-[400px]">
              {featured.thumbnail ? (
                <img
                  src={featured.thumbnail}
                  alt={featured.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[#171719] text-gray-700">
                  <Radio size={48} />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />

              <div className="absolute inset-0 flex items-center p-6 sm:p-10 lg:p-14">
                <div className="max-w-xl">
                  <span
                    className={`mb-4 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                      featured.live ? "bg-red-600" : "bg-white/10"
                    }`}
                  >
                    {featured.live ? "LIVE" : "FEATURED"}
                  </span>

                  <h2 className="text-3xl font-bold sm:text-5xl">
                    {featured.title}
                  </h2>

                  <p className="mt-4 text-sm leading-6 text-gray-300 sm:text-base">
                    {featured.description ||
                      `${featured.category} • ${
                        featured.creator || "Streamora"
                      }`}
                  </p>

                  <div className="mt-4 flex items-center gap-4 text-sm text-gray-300">
                    <span>{featured.category}</span>

                    <span>
                      {featured.live
                        ? `${(featured.viewerCount || 0).toLocaleString()} watching`
                        : `${(featured.totalViews || 0).toLocaleString()} total views`}
                    </span>
                  </div>

                  <div className="mt-6 flex gap-3">
                    <span className="flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-black transition group-hover:bg-gray-200">
                      <Play size={17} fill="currentColor" />
                      Watch Now
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        <div>
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold sm:text-2xl">
              {activeCategory === "All"
                ? loading
                  ? "All Streams"
                  : `${filteredStreams.length} ${filteredStreams.length === 1 ? "stream" : "streams"}`
                : `${activeCategory} Streams`}
            </h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="aspect-video animate-pulse rounded-2xl bg-white/[0.04]"
                />
              ))}
            </div>
          ) : filteredStreams.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] py-16 text-center">
              <Search size={32} className="mx-auto mb-3 text-gray-700" />

              <p className="font-medium text-gray-300">No streams found</p>

              <p className="mt-1 text-sm text-gray-500">
                Try another category or search term.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {filteredStreams.map((stream) => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Browse;