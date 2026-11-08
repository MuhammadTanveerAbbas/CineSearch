import { cachedRequest } from "../utils/cache";

const API_BASE_URL = "https://api.themoviedb.org/3";
const API_KEY = import.meta.env.VITE_APP_API_KEY || import.meta.env.VITE_TMDB_API_KEY || import.meta.env.VITE_API_KEY;

const TTL = {
  genres: 7 * 24 * 60 * 60 * 1000,
  trending: 20 * 60 * 1000,
  list: 10 * 60 * 1000,
  details: 12 * 60 * 60 * 1000,
};

const DETAIL_APPENDS = {
  movie:
    "credits,videos,keywords,release_dates,watch/providers,external_ids,recommendations,alternative_titles,images",
  tv:
    "aggregate_credits,credits,videos,keywords,content_ratings,watch/providers,external_ids,recommendations,alternative_titles,images",
};

const getApiOptions = () => {
  const headers = {
    accept: "application/json",
  };
  if (API_KEY && API_KEY.length > 30) {
    headers.Authorization = `Bearer ${API_KEY}`;
  }
  return {
    method: "GET",
    headers,
  };
};

const buildUrl = (endpoint) => {
  if (API_KEY && (!API_KEY.includes(".") || API_KEY.length < 30)) {
    const separator = endpoint.includes("?") ? "&" : "?";
    return `${endpoint}${separator}api_key=${API_KEY}`;
  }
  return endpoint;
};

const requestJson = (endpoint, ttlMs) => {
  if (!API_KEY) {
    throw new Error("Missing TMDB API key. Add VITE_APP_API_KEY to your .env file.");
  }

  return cachedRequest(`tmdb:${endpoint}`, ttlMs, async () => {
    const response = await fetch(buildUrl(endpoint), getApiOptions());
    if (!response.ok) {
      throw new Error(`TMDB request failed (${response.status})`);
    }
    return response.json();
  });
};

const kindOf = (mediaType) => (mediaType === "tv" ? "tv" : "movie");

export const fetchGenres = (mediaType = "movie") =>
  requestJson(
    `${API_BASE_URL}/genre/${kindOf(mediaType)}/list?language=en-US`,
    TTL.genres
  );

export const fetchMovies = (query = "", filters = {}, page = 1, mediaType = "movie") => {
  const kind = kindOf(mediaType);
  const params = new URLSearchParams();
  params.append("include_adult", "false");
  params.append("language", "en-US");
  params.append("page", String(Math.max(1, Number(page) || 1)));

  let endpoint = `${API_BASE_URL}/search/${kind}`;
  if (query && query.trim()) {
    params.append("query", query.trim());
  } else {
    endpoint = `${API_BASE_URL}/discover/${kind}`;
    let sortBy = filters.sortBy || "popularity.desc";
    if (kind === "tv") {
      if (sortBy === "primary_release_date.desc") sortBy = "first_air_date.desc";
      if (sortBy === "revenue.desc") sortBy = "popularity.desc";
      if (sortBy === "title.asc") sortBy = "name.asc";
      if (sortBy === "title.desc") sortBy = "name.desc";
    }
    params.append("sort_by", sortBy);
    if (filters.sortBy === "vote_average.desc") {
      params.append("vote_count.gte", "200");
    }
    if (filters.minRating) {
      params.append("vote_average.gte", filters.minRating);
    }
    if (filters.genreId) {
      params.append("with_genres", filters.genreId);
    }
    if (filters.year) {
      params.append(kind === "tv" ? "first_air_date_year" : "primary_release_year", filters.year);
    }
  }

  return requestJson(`${endpoint}?${params.toString()}`, TTL.list);
};

export const fetchTrendingMovies = (timeWindow = "day", mediaType = "movie") =>
  requestJson(
    `${API_BASE_URL}/trending/${kindOf(mediaType)}/${timeWindow}?language=en-US`,
    TTL.trending
  );

export const fetchMovieDetails = (movieId, mediaType = "movie") => {
  const kind = kindOf(mediaType);
  return requestJson(
    `${API_BASE_URL}/${kind}/${movieId}?language=en-US&append_to_response=${DETAIL_APPENDS[kind]}&include_image_language=en,null`,
    TTL.details
  );
};
