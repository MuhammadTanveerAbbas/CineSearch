import { useEffect, useRef } from "react";
import {
  TMDB_IMAGE_BASE,
  formatDate,
  formatMoney,
  formatNumber,
  formatPopularity,
  formatRuntime,
  getCertification,
  getContentRating,
  getExternalLinks,
  getWatchProviders,
  joinNames,
} from "../utils/movieFormat";

const getTrailer = (videos) => {
  const results = videos?.results;
  if (!Array.isArray(results)) return null;
  return (
    results.find((video) => video?.site === "YouTube" && video?.type === "Trailer" && video?.official) ||
    results.find((video) => video?.site === "YouTube" && video?.type === "Trailer") ||
    results.find((video) => video?.site === "YouTube") ||
    null
  );
};

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const PlayIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const BookmarkIcon = ({ filled }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 4h12v17l-6-4-6 4V4z" />
  </svg>
);

const Fact = ({ label, value }) => (
  <div className="fact">
    <dt>{label}</dt>
    <dd>{value ?? "Not available"}</dd>
  </div>
);

const MovieModal = ({ movie, onClose, onSelectMovie, isSaved = false, onToggleWatchlist, genres: allGenres = [] }) => {
  const closeRef = useRef(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [onClose]);

  if (!movie) return null;

  const {
    id,
    media_type,
    _mediaType,
    title,
    name,
    original_title,
    original_name,
    tagline,
    status,
    backdrop_path,
    poster_path,
    overview,
    vote_average,
    vote_count,
    popularity,
    release_date,
    first_air_date,
    original_language,
    runtime,
    episode_run_time,
    number_of_seasons,
    number_of_episodes,
    genres,
    genre_ids,
    budget,
    revenue,
    homepage,
    imdb_id,
    adult,
    video,
    spoken_languages,
    production_companies,
    production_countries,
    credits,
    aggregate_credits,
    created_by,
    videos,
    keywords,
    release_dates,
    content_ratings,
    "watch/providers": watchProviders,
    external_ids,
    recommendations,
    alternative_titles,
    images,
    belongs_to_collection,
    _loading,
  } = movie;

  const isTv = (_mediaType || media_type) === "tv";
  const displayTitle = title || name || "Untitled";
  const originalTitle = original_title || original_name || "";
  const releaseDate = release_date || first_air_date || "";
  const runtimeValue =
    runtime || (Array.isArray(episode_run_time) ? episode_run_time[0] : null) || null;
  const year = releaseDate ? String(releaseDate).slice(0, 4) : "";
  const posterSrc = poster_path ? `${TMDB_IMAGE_BASE}/w500${poster_path}` : "/no-movie.webp";
  const backdropSrc = backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${backdrop_path}` : null;
  const ratingValue = typeof vote_average === "number" ? vote_average.toFixed(1) : "N/A";
  const languageValue = original_language ? original_language.toUpperCase() : "Not available";
  const genreObjects = Array.isArray(genres) ? genres : [];
  const resolvedGenreNames = genreObjects.length
    ? genreObjects.map((genre) => genre.name).filter(Boolean)
    : Array.isArray(genre_ids)
      ? genre_ids.map((genreId) => allGenres.find((genre) => genre.id === genreId)?.name).filter(Boolean)
      : [];
  const cast = Array.isArray(credits?.cast)
    ? credits.cast.slice(0, 12)
    : Array.isArray(aggregate_credits?.cast)
      ? aggregate_credits.cast.slice(0, 12)
      : [];
  const crew = Array.isArray(credits?.crew)
    ? credits.crew
        .filter((person) => ["Director", "Writer", "Screenplay", "Producer", "Original Music Composer"].includes(person?.job))
        .slice(0, 8)
    : [];
  const creators = Array.isArray(created_by) ? created_by.slice(0, 4) : [];
  const trailer = getTrailer(videos);
  const hasOriginalTitle = originalTitle.trim() && originalTitle !== displayTitle;
  const certification = isTv ? getContentRating(content_ratings) : getCertification(release_dates);
  const watch = getWatchProviders(watchProviders);
  const externalLinks = getExternalLinks(external_ids, homepage);
  const keywordList = Array.isArray(keywords?.keywords)
    ? keywords.keywords
    : Array.isArray(keywords?.results)
      ? keywords.results
      : [];
  const recommendationList = Array.isArray(recommendations?.results) ? recommendations.results.slice(0, 10) : [];
  const altTitles = Array.isArray(alternative_titles?.titles)
    ? alternative_titles.titles.slice(0, 12)
    : Array.isArray(alternative_titles?.results)
      ? alternative_titles.results.slice(0, 12)
      : [];
  const imageCounts = images
    ? {
        backdrops: Array.isArray(images.backdrops) ? images.backdrops.length : 0,
        posters: Array.isArray(images.posters) ? images.posters.length : 0,
        logos: Array.isArray(images.logos) ? images.logos.length : 0,
      }
    : null;
  const effectiveImdbId = imdb_id || external_ids?.imdb_id;
  const metaLine = [
    year,
    runtimeValue ? formatRuntime(runtimeValue) : "",
    isTv && number_of_seasons ? `${number_of_seasons} season${number_of_seasons === 1 ? "" : "s"}` : "",
    certification ? `${certification.certification} (${certification.country})` : "",
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className="modal"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          className="modal__close"
          aria-label="Close details"
        >
          <CloseIcon />
        </button>

        <div className="modal__hero">
          {backdropSrc ? (
            <img className="modal__backdrop" src={backdropSrc} alt="" aria-hidden="true" />
          ) : (
            <div className="modal__backdrop modal__backdrop--empty" aria-hidden="true" />
          )}
          <div className="modal__shade" aria-hidden="true" />

          <div className="modal__hero-content">
            <img className="modal__poster" src={posterSrc} alt={`${displayTitle} poster`} width="300" height="450" />
            <div className="modal__intro">
              <p className="eyebrow">{adult ? "Adults only" : isTv ? "TV series" : "Feature film"}</p>
              <h2 className="modal__title" id="modal-title">{displayTitle}</h2>
              {hasOriginalTitle ? <p className="modal__original">Original title: {originalTitle}</p> : null}
              {tagline ? <p className="modal__tagline">&ldquo;{tagline}&rdquo;</p> : null}
              {metaLine ? <p className="modal__meta">{metaLine}</p> : null}

              <div className="modal__chips" aria-label="Quick facts">
                <span className="chip chip--rating">
                  <img src="/star.svg" alt="" aria-hidden="true" />
                  {ratingValue}
                  <span className="chip__muted">({formatNumber(vote_count)} votes)</span>
                </span>
                {status ? <span className="chip">{status}</span> : null}
                {release_date || first_air_date ? <span className="chip">{formatDate(releaseDate)}</span> : null}
                <span className="chip">{languageValue}</span>
                {video ? <span className="chip">Video</span> : null}
              </div>

              {resolvedGenreNames.length > 0 ? (
                <div className="modal__genres" aria-label="Genres">
                  {resolvedGenreNames.map((name) => (
                    <span key={name} className="genre-tag">{name}</span>
                  ))}
                </div>
              ) : null}

              {belongs_to_collection?.name ? (
                <p className="modal__collection">
                  Part of <strong>{belongs_to_collection.name}</strong>
                </p>
              ) : null}

              <div className="modal__actions">
                {trailer ? (
                  <a
                    className="btn btn--primary"
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <PlayIcon /> Watch trailer
                  </a>
                ) : null}
                {watch?.link ? (
                  <a className="btn btn--outline" href={watch.link} target="_blank" rel="noreferrer">
                    Where to watch
                  </a>
                ) : null}
                {onToggleWatchlist ? (
                  <button
                    type="button"
                    className={`btn btn--outline ${isSaved ? "is-saved" : ""}`}
                    onClick={() => onToggleWatchlist(movie)}
                    aria-pressed={isSaved}
                  >
                    <BookmarkIcon filled={isSaved} />
                    {isSaved ? "Saved" : "Save"}
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div className="modal__body">
          {_loading ? <p className="modal__loading">Loading full details…</p> : null}

          <section className="modal__section" aria-labelledby="movie-overview-heading">
            <h3 id="movie-overview-heading">Overview</h3>
            <p className="modal__text">{overview && overview.trim() ? overview : "No overview available."}</p>
          </section>

          {watch?.providers?.length ? (
            <section className="modal__section" aria-labelledby="movie-watch-heading">
              <h3 id="movie-watch-heading">Where to watch <span>{watch.country}</span></h3>
              <ul className="provider-list">
                {watch.providers.map((provider) => (
                  <li key={provider.provider_id || provider.provider_name} className="provider">
                    {provider.logo_path ? (
                      <img
                        src={`${TMDB_IMAGE_BASE}/w92${provider.logo_path}`}
                        alt=""
                        aria-hidden="true"
                        loading="lazy"
                        width="32"
                        height="32"
                      />
                    ) : null}
                    <span>{provider.provider_name}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {cast.length > 0 ? (
            <section className="modal__section" aria-labelledby="movie-cast-heading">
              <h3 id="movie-cast-heading">Top cast</h3>
              <ul className="cast-grid">
                {cast.map((person) => (
                  <li key={`${person.cast_id || person.credit_id || person.id}-${person.character || "cast"}`} className="cast-card">
                    <span className="cast-card__name">{person.name}</span>
                    {person.character || person.roles?.[0]?.character ? (
                      <span className="cast-card__role">{person.character || person.roles[0].character}</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {crew.length > 0 ? (
            <section className="modal__section" aria-labelledby="movie-crew-heading">
              <h3 id="movie-crew-heading">Key crew</h3>
              <ul className="crew-list">
                {crew.map((person) => (
                  <li key={`${person.credit_id || person.id}-${person.job}`}>
                    <span>{person.name}</span>
                    {person.job ? <em>{person.job}</em> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {creators.length > 0 ? (
            <section className="modal__section" aria-labelledby="movie-creators-heading">
              <h3 id="movie-creators-heading">Created by</h3>
              <ul className="crew-list">
                {creators.map((person) => (
                  <li key={person.credit_id || person.id}>
                    <span>{person.name}</span>
                    <em>Creator</em>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {keywordList.length > 0 || externalLinks.length > 0 || altTitles.length > 0 ? (
            <div className="modal__split">
              {keywordList.length > 0 ? (
                <section className="modal__section" aria-labelledby="movie-keywords-heading">
                  <h3 id="movie-keywords-heading">Keywords</h3>
                  <div className="tag-list">
                    {keywordList.map((item) => (
                      <span key={item.id || item.name} className="tag">{item.name}</span>
                    ))}
                  </div>
                </section>
              ) : null}

              {externalLinks.length > 0 ? (
                <section className="modal__section" aria-labelledby="movie-links-heading">
                  <h3 id="movie-links-heading">Links</h3>
                  <div className="tag-list">
                    {externalLinks.map((link) => (
                      <a key={link.label} href={link.url} target="_blank" rel="noreferrer" className="tag tag--link">
                        {link.label}
                      </a>
                    ))}
                  </div>
                </section>
              ) : null}
            </div>
          ) : null}

          {altTitles.length > 0 ? (
            <details className="modal__more">
              <summary>Alternative titles ({alternative_titles?.titles?.length ?? altTitles.length})</summary>
              <ul className="alt-list">
                {altTitles.map((item, index) => (
                  <li key={`${item.iso_3166_1 || "alt"}-${item.title}-${index}`}>
                    <span>{item.title}</span>
                    {item.iso_3166_1 ? <em>{item.iso_3166_1}{item.type ? `, ${item.type}` : ""}</em> : null}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          {Array.isArray(videos?.results) && videos.results.length > 0 ? (
            <details className="modal__more">
              <summary>Videos ({videos.results.length})</summary>
              <ul className="video-list">
                {videos.results.slice(0, 10).map((item) => (
                  <li key={item.id || item.key}>
                    {item.site === "YouTube" && item.key ? (
                      <a href={`https://www.youtube.com/watch?v=${item.key}`} target="_blank" rel="noreferrer">
                        {item.name || "Video"}{item.type ? ` (${item.type})` : ""}
                      </a>
                    ) : (
                      <span>{item.name || "Video"}{item.site ? ` (${item.site})` : ""}</span>
                    )}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          <details className="modal__more">
            <summary>Full technical details</summary>
            <dl className="fact-grid">
              <Fact label="TMDB ID" value={id ?? "Not available"} />
              <Fact label="Original title" value={originalTitle || "Not available"} />
              <Fact label="Tagline" value={tagline || "Not available"} />
              <Fact label="Status" value={status || "Not available"} />
              <Fact label={isTv ? "First aired" : "Release date"} value={formatDate(releaseDate)} />
              <Fact label="Certification" value={certification ? `${certification.certification} (${certification.country})` : "Not available"} />
              <Fact label={isTv ? "Episode runtime" : "Runtime"} value={formatRuntime(runtimeValue)} />
              <Fact label="Original language" value={languageValue} />
              <Fact label="Spoken languages" value={joinNames(spoken_languages)} />
              <Fact label="Rating" value={`${ratingValue} / 10`} />
              <Fact label="Vote count" value={formatNumber(vote_count)} />
              <Fact label="Popularity" value={formatPopularity(popularity)} />
              {isTv ? (
                <>
                  <Fact label="Seasons" value={number_of_seasons ?? "Not available"} />
                  <Fact label="Episodes" value={number_of_episodes ?? "Not available"} />
                </>
              ) : (
                <>
                  <Fact label="Budget" value={formatMoney(budget)} />
                  <Fact label="Revenue" value={formatMoney(revenue)} />
                </>
              )}
              <Fact label="IMDb ID" value={effectiveImdbId || "Not available"} />
              <Fact label="Homepage" value={homepage ? <a href={homepage} target="_blank" rel="noreferrer">{homepage}</a> : "Not available"} />
              <Fact label="Collection" value={belongs_to_collection?.name || "Not available"} />
              <Fact label="Production companies" value={joinNames(production_companies, 8)} />
              <Fact label="Production countries" value={joinNames(production_countries)} />
              <Fact label="Genres" value={resolvedGenreNames.length ? resolvedGenreNames.join(", ") : "Not available"} />
              <Fact label="Keywords count" value={keywordList.length ? String(keywordList.length) : "Not available"} />
              <Fact label="Recommendations count" value={recommendationList.length ? String(recommendations?.results?.length ?? recommendationList.length) : "Not available"} />
              <Fact label="Images" value={imageCounts ? `Posters ${imageCounts.posters}, backdrops ${imageCounts.backdrops}, logos ${imageCounts.logos}` : "Not available"} />
            </dl>
          </details>

          {recommendationList.length > 0 ? (
            <section className="modal__section" aria-labelledby="movie-recs-heading">
              <h3 id="movie-recs-heading">More like this</h3>
              <ul className="rec-grid">
                {recommendationList.map((item) => {
                  const recTitle = item.title || item.name || "Untitled";
                  const recYear = item.release_date || item.first_air_date
                    ? String(item.release_date || item.first_air_date).slice(0, 4)
                    : "";
                  const content = (
                    <>
                      {item.poster_path ? (
                        <img
                          src={`${TMDB_IMAGE_BASE}/w185${item.poster_path}`}
                          alt=""
                          aria-hidden="true"
                          className="rec-card__poster"
                          loading="lazy"
                          width="92"
                          height="138"
                        />
                      ) : (
                        <span className="rec-card__poster rec-card__poster--empty" aria-hidden="true" />
                      )}
                      <span className="rec-card__body">
                        <span className="rec-card__title">{recTitle}</span>
                        {recYear ? <span className="rec-card__year">{recYear}</span> : null}
                      </span>
                    </>
                  );
                  return (
                    <li key={item.id}>
                      {onSelectMovie ? (
                        <button type="button" className="rec-card" onClick={() => onSelectMovie(item)}>
                          {content}
                        </button>
                      ) : (
                        <div className="rec-card">{content}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MovieModal;
