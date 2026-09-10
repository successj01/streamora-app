import React from "react";
import { Link } from "react-router-dom";
import {
  FiArrowUpRight,
  FiPlay,
} from "react-icons/fi";

const CategoryCard = ({ category }) => {
  if (!category) return null;

  const {
    name = "Category",
    viewers = 0,
    image,
    icon: Icon,
  } = category;

  return (
    <Link
      to={`/browse?category=${encodeURIComponent(name)}`}
      className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-[#18181b]"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden">

        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#27272a] text-gray-500">
            {Icon ? <Icon size={40} /> : <FiPlay size={40} />}
          </div>
        )}

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        {/* Icon */}
        <div className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-white backdrop-blur-md">
          {Icon ? <Icon size={20} /> : <FiPlay size={20} />}
        </div>

        {/* Arrow */}
        <div className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur-md transition duration-300 group-hover:opacity-100">
          <FiArrowUpRight size={18} />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">

          <h3 className="text-lg font-bold text-white">
            {name}
          </h3>

          <p className="mt-1 text-sm text-gray-300">
            {formatViewers(viewers)} watching
          </p>

        </div>
      </div>
    </Link>
  );
};

const formatViewers = (value) => {
  if (typeof value === "string") {
    return value;
  }

  const number = Number(value) || 0;

  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`;
  }

  if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`;
  }

  return number.toString();
};

export default CategoryCard;