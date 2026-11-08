import { useState } from "react";
import { TMDB_IMAGE_BASE } from "../utils/movieFormat";

const FALLBACK_POSTER = "/no-movie.webp";

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

const BookmarkIcon = ({ filled }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 4h12v17l-6-4-6 4V4z" />
  </svg>
);

const MovieCard = ({ movie, genres = [], onClick, isSaved = false, onToggleWatchlist, mediaType = "movie" }) => {
  const [imageFailed, setImageFailed] = useState(false);

  const {
    title,
    name,
    overview,
    release_date,
    first_air_date,
    poster_path,
    vote_average,
    genre_ids,
    adult,
  } = movie;

  const isTv = (movie._mediaType || mediaType) === "tv";
  const displayTitle = title || name || "Untitled";
  const dateValue = release_date || first_air_date || "";
  const year = dateValue ? String(dateValue).slice(0, 4) : "";
  const rating = typeof vote_average === "number" && vote_average > 0 ? vote_average.toFixed(1) : null;
  const genreNames = Array.isArray(genre_ids)
    ? genre_ids
        .map((genreId) => genres.find((genre) => genre.id === genreId)?.name)
        .filter(Boolean)
        .slice(0, 3)
    : [];
  const posterSrc = !poster_path || imageFailed
    ? FALLBACK_POSTER
    : `${TMDB_IMAGE_BASE}/w342${poster_path}`;
  const posterSrcSet = !poster_path || imageFailed
    ? undefined
    : `${TMDB_IMAGE_BASE}/w342${poster_path} 342w, ${TMDB_IMAGE_BASE}/w500${poster_path} 500w`;
  const meta = [isTv ? "TV" : "", year, genreNames.join(" · ")].filter(Boolean).join(" · ");

  return (
    <article className="movie-card">
      <button
        type="button"
        className="movie-card__open"
        onClick={() => onClick?.(movie)}
        aria-label={`Open details for ${displayTitle}`}
      >
        <div className="movie-card__media">
          <img
            src={posterSrc}
            srcSet={posterSrcSet}
            sizes="(min-width: 1024px) 210px, 45vw"
            alt={`${displayTitle} poster`}
            loading="lazy"
            decoding="async"
            width="342"
            height="513"
            onError={() => setImageFailed(true)}
          />
          {rating ? (
            <span className="movie-card__rating" aria-label={`Rated ${rating} out of 10`}>
              <img src="/star.svg" alt="" aria-hidden="true" />
              {rating}
            </span>
          ) : null}
          {adult ? <span className="movie-card__adult">18+</span> : null}
          <span className="movie-card__cue" aria-hidden="true"><ArrowIcon /></span>
        </div>
      </button>

      <div className="movie-card__body">
        <h3 className="movie-card__title">
          <button
            type="button"
            className="movie-card__title-btn"
            onClick={() => onClick?.(movie)}
            title={displayTitle}
          >
            {displayTitle}
          </button>
        </h3>
        {meta ? <p className="movie-card__meta">{meta}</p> : null}
        {overview ? <p className="movie-card__overview">{overview}</p> : null}

        <div className="movie-card__actions">
          <button type="button" className="btn-card" onClick={() => onClick?.(movie)}>
            View details
          </button>
          {onToggleWatchlist ? (
            <button
              type="button"
              className={`btn-save ${isSaved ? "is-saved" : ""}`}
              onClick={() => onToggleWatchlist(movie)}
              aria-pressed={isSaved}
              aria-label={isSaved ? `Remove ${displayTitle} from watchlist` : `Save ${displayTitle} to watchlist`}
              title={isSaved ? "Remove from watchlist" : "Save to watchlist"}
            >
              <BookmarkIcon filled={isSaved} />
            </button>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default MovieCard;
