const IMAGE_BASE = "https://image.tmdb.org/t/p";

export const TMDB_IMAGE_BASE = IMAGE_BASE;

export const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
};

export const formatNumber = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "Not available";
  return new Intl.NumberFormat("en-US").format(value);
};

export const formatMoney = (value) => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) return "Not available";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatRuntime = (value) => {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) return "Not available";
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  if (!hours) return `${minutes} min`;
  if (!minutes) return `${hours} h`;
  return `${hours} h ${minutes} min`;
};

export const formatPopularity = (value) => {
  if (typeof value !== "number" || Number.isNaN(value)) return "Not available";
  return value.toFixed(1);
};

export const joinNames = (items, limit) => {
  if (!Array.isArray(items) || items.length === 0) return "Not available";
  const names = items.map((item) => item?.name || item?.english_name).filter(Boolean);
  if (names.length === 0) return "Not available";
  const sliced = typeof limit === "number" ? names.slice(0, limit) : names;
  const suffix = typeof limit === "number" && names.length > limit ? ` +${names.length - limit} more` : "";
  return `${sliced.join(", ")}${suffix}`;
};

export const getCertification = (releaseDates) => {
  const results = releaseDates?.results;
  if (!Array.isArray(results)) return null;
  const preferred = ["US", "IN", "GB", "CA", "AU"];
  const pickFrom = (entry) => {
    const list = entry?.release_dates;
    if (!Array.isArray(list)) return null;
    const found = list.find((r) => r?.certification && String(r.certification).trim());
    return found ? { country: entry.iso_3166_1, certification: String(found.certification).trim() } : null;
  };
  for (const code of preferred) {
    const entry = results.find((r) => r?.iso_3166_1 === code);
    const picked = pickFrom(entry);
    if (picked) return picked;
  }
  for (const entry of results) {
    const picked = pickFrom(entry);
    if (picked) return picked;
  }
  return null;
};

export const getContentRating = (contentRatings) => {
  const results = contentRatings?.results;
  if (!Array.isArray(results)) return null;
  const preferred = ["US", "IN", "GB", "CA", "AU"];
  for (const code of preferred) {
    const entry = results.find((item) => item?.iso_3166_1 === code && item?.rating);
    if (entry) return { country: entry.iso_3166_1, certification: entry.rating };
  }
  const any = results.find((item) => item?.rating);
  return any ? { country: any.iso_3166_1, certification: any.rating } : null;
};

export const getWatchProviders = (watchProviders) => {
  const results = watchProviders?.results;
  if (!results || typeof results !== "object") return null;
  const preferred = ["US", "IN", "GB", "CA", "AU"];
  let country = preferred.find((code) => results[code]);
  if (!country) country = Object.keys(results)[0];
  if (!country) return null;
  const data = results[country];
  if (!data) return null;
  const merge = (key) => (Array.isArray(data[key]) ? data[key] : []);
  const providers = [...merge("flatrate"), ...merge("rent"), ...merge("buy")];
  const seen = new Set();
  const unique = providers.filter((p) => {
    const id = p?.provider_id ?? p?.provider_name;
    if (id == null || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
  return {
    country,
    link: data.link || null,
    providers: unique,
  };
};

export const getExternalLinks = (externalIds, homepage) => {
  if (!externalIds || typeof externalIds !== "object") {
    return homepage ? [{ label: "Homepage", url: homepage }] : [];
  }
  const links = [];
  if (externalIds.imdb_id) links.push({ label: "IMDb", url: `https://www.imdb.com/title/${externalIds.imdb_id}` });
  if (externalIds.wikidata_id) links.push({ label: "Wikidata", url: `https://www.wikidata.org/wiki/${externalIds.wikidata_id}` });
  if (externalIds.facebook_id) links.push({ label: "Facebook", url: `https://www.facebook.com/${externalIds.facebook_id}` });
  if (externalIds.instagram_id) links.push({ label: "Instagram", url: `https://www.instagram.com/${externalIds.instagram_id}` });
  if (externalIds.twitter_id) links.push({ label: "X", url: `https://x.com/${externalIds.twitter_id}` });
  if (homepage) links.push({ label: "Homepage", url: homepage });
  return links;
};
