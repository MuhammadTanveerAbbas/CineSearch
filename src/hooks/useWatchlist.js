import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "cinesearch:watchlist:v1";
const MAX_ITEMS = 200;

const mediaKind = (value) => (value === "tv" ? "tv" : "movie");

const toSnapshot = (movie) => ({
  id: movie.id,
  _mediaType: mediaKind(movie._mediaType || movie.media_type),
  title: movie.title || movie.name || "Untitled",
  poster_path: movie.poster_path || null,
  backdrop_path: movie.backdrop_path || null,
  release_date: movie.release_date || movie.first_air_date || "",
  vote_average: typeof movie.vote_average === "number" ? movie.vote_average : null,
  overview: typeof movie.overview === "string" ? movie.overview.slice(0, 400) : "",
  genre_ids: Array.isArray(movie.genre_ids) ? movie.genre_ids.slice(0, 4) : [],
});

const readWatchlist = () => {
  if (typeof window === "undefined") return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item) => item && item.id != null)
      .map((item) => ({ ...item, _mediaType: mediaKind(item._mediaType) }))
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
};

const sameItem = (item, id, mediaType) =>
  item.id === id && mediaKind(item._mediaType) === mediaKind(mediaType);

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState(readWatchlist);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist));
    } catch {
      // Ignore quota or privacy mode errors.
    }
  }, [watchlist]);

  useEffect(() => {
    const sync = (event) => {
      if (event.key === STORAGE_KEY) setWatchlist(readWatchlist());
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const toggleWatchlist = useCallback((movie) => {
    if (!movie || movie.id == null) return;
    const type = mediaKind(movie._mediaType || movie.media_type);
    setWatchlist((prev) => {
      if (prev.some((item) => sameItem(item, movie.id, type))) {
        return prev.filter((item) => !sameItem(item, movie.id, type));
      }
      return [toSnapshot({ ...movie, _mediaType: type }), ...prev].slice(0, MAX_ITEMS);
    });
  }, []);

  const isSaved = useCallback(
    (id, mediaType = "movie") => watchlist.some((item) => sameItem(item, id, mediaType)),
    [watchlist]
  );

  return { watchlist, toggleWatchlist, isSaved };
};
