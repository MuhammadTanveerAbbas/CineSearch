import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDebounce } from "react-use";
import NavBar from "./components/NavBar.jsx";
import Search from "./components/Search.jsx";
import MovieCard from "./components/MovieCard.jsx";
import MovieModal from "./components/MovieModal.jsx";
import TrendingToday from "./components/TrendingToday.jsx";
import FilterBar from "./components/FilterBar.jsx";
import Footer from "./components/Footer.jsx";
import MediaSwitch from "./components/MediaSwitch.jsx";
import { useWatchlist } from "./hooks/useWatchlist.js";
import { formatNumber, TMDB_IMAGE_BASE } from "./utils/movieFormat";
import { fetchDailyQuote } from "./services/extras";
import {
  fetchMovies as fetchMoviesAPI,
  fetchTrendingMovies,
  fetchMovieDetails as fetchMovieDetailsAPI,
  fetchGenres,
} from "./services/api";

const DEFAULT_SORT = "popularity.desc";

const MovieSkeletonGrid = () => (
  <ul className="movie-grid" aria-hidden="true">
    {Array.from({ length: 12 }).map((_, index) => (
      <li key={index} className="skeleton-card">
        <div className="skeleton-card__poster" />
        <div className="skeleton-line skeleton-line--card" />
        <div className="skeleton-line skeleton-line--card-short" />
      </li>
    ))}
  </ul>
);

const SparkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
    <path d="M18 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" />
  </svg>
);

const App = () => {
  const [mediaType, setMediaType] = useState("movie");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const [movieList, setMovieList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isTrendingLoading, setIsTrendingLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [minRating, setMinRating] = useState("");
  const [sortBy, setSortBy] = useState(DEFAULT_SORT);
  const [quote, setQuote] = useState(null);

  const listVersionRef = useRef(0);
  const { watchlist, toggleWatchlist, isSaved } = useWatchlist();

  useDebounce(() => setDebouncedSearchTerm(searchTerm.trim()), 300, [searchTerm]);

  const filters = useMemo(() => {
    const genreId = selectedGenre
      ? genres.find((genre) => genre.name === selectedGenre)?.id || ""
      : "";
    return { genreId, year: selectedYear, minRating, sortBy };
  }, [selectedGenre, selectedYear, minRating, sortBy, genres]);

  const loadMovies = useCallback(
    async ({ page: targetPage = 1, append = false, type = mediaType } = {}) => {
      listVersionRef.current += 1;
      const version = listVersionRef.current;
      if (append) setIsLoadingMore(true);
      else setIsLoading(true);
      setErrorMessage("");

      try {
        const data = await fetchMoviesAPI(debouncedSearchTerm, filters, targetPage, type);
        if (listVersionRef.current !== version) return;

        if (data?.success === false) {
          setErrorMessage(data.status_message || "Could not load titles.");
          if (!append) setMovieList([]);
          return;
        }

        const results = Array.isArray(data?.results) ? data.results : [];
        setMovieList((previous) => {
          if (!append) return results;
          const seen = new Set(previous.map((item) => `${item._mediaType || type}-${item.id}`));
          return [
            ...previous,
            ...results
              .filter((item) => !seen.has(`${item._mediaType || type}-${item.id}`))
              .map((item) => ({ ...item, _mediaType: item._mediaType || type })),
          ];
        });
        setPage(Number(data?.page) || targetPage);
        setTotalPages(Number(data?.total_pages) || 1);
        setTotalResults(Number(data?.total_results) || results.length);
      } catch (error) {
        if (listVersionRef.current !== version) return;
        console.error("Error fetching titles:", error);
        setErrorMessage(error.message || "Something went wrong. Please try again.");
        if (!append) setMovieList([]);
      } finally {
        if (listVersionRef.current === version) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [debouncedSearchTerm, filters, mediaType]
  );

  const loadTrendingMovies = useCallback(async (type = mediaType) => {
    setIsTrendingLoading(true);
    try {
      const data = await fetchTrendingMovies("day", type);
      setTrendingMovies(Array.isArray(data?.results) ? data.results.slice(0, 12) : []);
    } catch (error) {
      console.error("Error fetching trending titles:", error);
      setTrendingMovies([]);
    } finally {
      setIsTrendingLoading(false);
    }
  }, [mediaType]);

  const loadGenres = useCallback(async (type = mediaType) => {
    try {
      const data = await fetchGenres(type);
      setGenres(Array.isArray(data?.genres) ? data.genres : []);
    } catch (error) {
      console.error("Error fetching genres:", error);
      setGenres([]);
    }
  }, [mediaType]);

  const openMovieDetails = useCallback(
    async (movie) => {
      if (!movie?.id) return;
      const type = movie._mediaType || movie.media_type || mediaType;
      setSelectedMovie({ ...movie, _mediaType: type, _loading: true });
      try {
        const details = await fetchMovieDetailsAPI(movie.id, type);
        setSelectedMovie((previous) =>
          previous && previous.id === details.id && previous._mediaType === type
            ? { ...details, _mediaType: type }
            : previous
        );
      } catch (error) {
        console.error("Error fetching details:", error);
        setSelectedMovie((previous) =>
          previous && previous.id === movie.id
            ? { ...previous, _mediaType: type, _loading: false }
            : previous
        );
      }
    },
    [mediaType]
  );

  const goToSection = useCallback((id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleSelectGenre = useCallback(
    (genreName) => {
      setSelectedGenre(genreName);
      goToSection("browse");
    },
    [goToSection]
  );

  const handleMediaChange = useCallback(
    (type) => {
      setMediaType(type);
      setSelectedGenre("");
      setSelectedYear("");
      setMinRating("");
      setSortBy(DEFAULT_SORT);
      setPage(1);
      setMovieList([]);
    },
    []
  );

  const handleSurprise = useCallback(() => {
    const pool = (movieList.length ? movieList : trendingMovies).filter((item) => item?.id);
    if (!pool.length) {
      goToSection("browse");
      return;
    }
    const pick = pool[Math.floor(Math.random() * pool.length)];
    void openMovieDetails(pick);
  }, [movieList, trendingMovies, openMovieDetails, goToSection]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadMovies();
    });
  }, [loadMovies]);

  useEffect(() => {
    queueMicrotask(() => {
      void Promise.all([loadTrendingMovies(mediaType), loadGenres(mediaType), fetchDailyQuote().then(setQuote).catch(() => {})]);
    });
    const interval = window.setInterval(() => {
      void loadTrendingMovies(mediaType);
    }, 60 * 60 * 1000);
    return () => window.clearInterval(interval);
  }, [loadGenres, loadTrendingMovies, mediaType]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const active = document.activeElement;
      const tag = active?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || active?.isContentEditable) return;
      const input = document.querySelector(".hero .search input") || document.querySelector(".search input");
      if (input) {
        event.preventDefault();
        input.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const isTv = mediaType === "tv";
  const canLoadMore = page < Math.min(totalPages, 500);
  const hasResults = movieList.length > 0;
  const isFiltered =
    Boolean(selectedGenre) || Boolean(selectedYear) || Boolean(minRating) || sortBy !== DEFAULT_SORT;
  const collectionLabel = debouncedSearchTerm
    ? `Results for “${debouncedSearchTerm}”`
    : selectedGenre
      ? `${selectedGenre} ${isTv ? "series" : "movies"}`
      : isTv
        ? "Discover series"
        : "Discover movies";
  const countLabel = isLoading
    ? "Loading the catalogue…"
    : totalResults
      ? `${formatNumber(totalResults)} titles in this collection`
      : "Browse the full catalogue";
  const heroBackdrop = trendingMovies.find((item) => item?.backdrop_path)?.backdrop_path;

  return (
    <div className="app" id="top">
      <NavBar
        genres={genres}
        selectedGenre={selectedGenre}
        onSelectGenre={handleSelectGenre}
        watchlistCount={watchlist.length}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        mediaType={mediaType}
        onMediaChange={handleMediaChange}
        onSurprise={handleSurprise}
      />

      <main>
        <section className="hero" aria-labelledby="hero-title">
          <div
            className="hero__bg"
            aria-hidden="true"
            style={heroBackdrop ? { backgroundImage: `url(${TMDB_IMAGE_BASE}/w1280${heroBackdrop})` } : undefined}
          />
          <div className="container hero__inner">
            <div className="hero__grid">
              <div className="hero__content">
                <p className="eyebrow">{isTv ? "The series directory" : "The movie directory"}</p>
                <h1 id="hero-title">
                  {isTv ? (
                    <>Find your next<br />binge.</>
                  ) : (
                    <>Find your next<br />favourite film.</>
                  )}
                </h1>
                <p className="hero__sub">
                  {isTv
                    ? "Search thousands of series, follow what is trending today, and keep a watchlist of everything you want to watch next."
                    : "Search thousands of films, follow what is trending today, and build a watchlist of everything you want to see next."}
                </p>

                <MediaSwitch mediaType={mediaType} onChange={handleMediaChange} />

                <div className="hero__search">
                  <Search
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    placeholder={isTv ? "Search series, actors, genres…" : "Search films, actors, genres…"}
                  />
                </div>

                <div className="hero__quick">
                  <button type="button" className="hero__surprise" onClick={handleSurprise}>
                    <SparkIcon /> Surprise me
                  </button>
                  <button type="button" className="hero__link" onClick={() => goToSection("watchlist")}>
                    Watchlist <span>{watchlist.length}</span>
                  </button>
                </div>
              </div>

              <dl className="hero__stats" aria-label="Directory stats">
                <div className="hero__stat">
                  <dt>Trending today</dt>
                  <dd>{trendingMovies.length || "—"}</dd>
                </div>
                <div className="hero__stat">
                  <dt>Genres</dt>
                  <dd>{genres.length || "—"}</dd>
                </div>
                <div className="hero__stat">
                  <dt>Your watchlist</dt>
                  <dd>{watchlist.length}</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {debouncedSearchTerm ? null : (
          <TrendingToday
            movies={trendingMovies}
            genres={genres}
            isLoading={isTrendingLoading}
            onSelectMovie={openMovieDetails}
            title={isTv ? "Trending series today" : "Trending today"}
            subtitle={
              isTv
                ? "The series everyone is watching right now."
                : "The titles everyone is watching right now."
            }
          />
        )}

        <section className="browse" id="browse" aria-labelledby="browse-title">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">
                  {debouncedSearchTerm ? "Search" : isFiltered ? "Filtered" : "Browse"}
                </p>
                <h2 className="section-title" id="browse-title">{collectionLabel}</h2>
                <p className="section-sub">{countLabel}</p>
              </div>
              {hasResults ? (
                <span className="count-pill">{formatNumber(movieList.length)} loaded</span>
              ) : null}
            </div>

            {debouncedSearchTerm ? null : (
              <FilterBar
                genres={genres}
                selectedGenre={selectedGenre}
                setSelectedGenre={setSelectedGenre}
                sortBy={sortBy}
                setSortBy={setSortBy}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                minRating={minRating}
                setMinRating={setMinRating}
                mediaType={mediaType}
                onSurprise={handleSurprise}
              />
            )}

            {isLoading && !hasResults ? (
              <MovieSkeletonGrid />
            ) : errorMessage ? (
              <div className="state-panel" role="alert">
                <p className="state-panel__title">Could not load titles</p>
                <p className="state-panel__text">{errorMessage}</p>
                <button type="button" className="btn btn--primary" onClick={() => void loadMovies()}>
                  Try again
                </button>
              </div>
            ) : !hasResults ? (
              <div className="state-panel">
                <p className="state-panel__title">Nothing matched</p>
                <p className="state-panel__text">
                  Try a different search term, or clear the genre, year and rating filters.
                </p>
                {isFiltered ? (
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => {
                      setSelectedGenre("");
                      setSelectedYear("");
                      setMinRating("");
                      setSortBy(DEFAULT_SORT);
                    }}
                  >
                    Clear filters
                  </button>
                ) : null}
              </div>
            ) : (
              <>
                {isLoading ? (
                  <p className="browse__updating" role="status">Updating results…</p>
                ) : null}
                <ul className="movie-grid">
                  {movieList.map((movie) => (
                    <li key={`${movie._mediaType || mediaType}-${movie.id}`}>
                      <MovieCard
                        movie={movie}
                        genres={genres}
                        onClick={openMovieDetails}
                        isSaved={isSaved(movie.id, movie._mediaType || mediaType)}
                        onToggleWatchlist={toggleWatchlist}
                        mediaType={mediaType}
                      />
                    </li>
                  ))}
                </ul>

                {canLoadMore ? (
                  <div className="browse__more">
                    <button
                      type="button"
                      className="btn btn--outline btn--wide"
                      onClick={() => void loadMovies({ page: page + 1, append: true })}
                      disabled={isLoadingMore}
                    >
                      {isLoadingMore ? "Loading more…" : `Load more ${isTv ? "series" : "movies"}`}
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </section>

        <section className="watchlist" id="watchlist" aria-labelledby="watchlist-title">
          <div className="container">
            <div className="section-head">
              <div>
                <p className="eyebrow">Yours</p>
                <h2 className="section-title" id="watchlist-title">Watchlist</h2>
                <p className="section-sub">Saved on this device. No account needed.</p>
              </div>
              {watchlist.length > 0 ? (
                <span className="count-pill">{watchlist.length} saved</span>
              ) : null}
            </div>

            {watchlist.length === 0 ? (
              <div className="state-panel state-panel--compact">
                <p className="state-panel__title">Your watchlist is empty</p>
                <p className="state-panel__text">
                  Use the bookmark button on any card to keep it here for later.
                </p>
                <button type="button" className="btn btn--outline" onClick={() => goToSection("browse")}>
                  Browse the catalogue
                </button>
              </div>
            ) : (
              <ul className="movie-grid">
                {watchlist.map((movie) => (
                  <li key={`${movie._mediaType}-${movie.id}`}>
                    <MovieCard
                      movie={movie}
                      genres={genres}
                      onClick={openMovieDetails}
                      isSaved={isSaved(movie.id, movie._mediaType)}
                      onToggleWatchlist={toggleWatchlist}
                      mediaType={movie._mediaType}
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>

      <Footer
        genres={genres}
        watchlistCount={watchlist.length}
        quote={quote}
        onBrowse={handleMediaChange}
        onSelectGenre={handleSelectGenre}
        onSection={goToSection}
        onTop={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      />

      {selectedMovie ? (
        <MovieModal
          movie={selectedMovie}
          genres={genres}
          onClose={() => setSelectedMovie(null)}
          onSelectMovie={openMovieDetails}
          isSaved={isSaved(selectedMovie.id, selectedMovie._mediaType || mediaType)}
          onToggleWatchlist={toggleWatchlist}
        />
      ) : null}
    </div>
  );
};

export default App;
