import { useEffect, useRef, useState } from "react";
import Search from "./Search.jsx";

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const BookmarkIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 4h12v17l-6-4-6 4V4z" />
  </svg>
);

const SparkIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
    <path d="M18 15.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" />
  </svg>
);

const NavBar = ({
  genres = [],
  selectedGenre,
  onSelectGenre,
  watchlistCount = 0,
  searchTerm,
  setSearchTerm,
  mediaType = "movie",
  onMediaChange,
  onSurprise,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [genreOpen, setGenreOpen] = useState(false);
  const genreRef = useRef(null);

  useEffect(() => {
    if (!genreOpen) return undefined;
    const onPointerDown = (event) => {
      if (genreRef.current && !genreRef.current.contains(event.target)) setGenreOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setGenreOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [genreOpen]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  const goTo = (id) => {
    setMobileOpen(false);
    setGenreOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const pickGenre = (name) => {
    onSelectGenre(name);
    goTo("browse");
  };

  return (
    <header className="navbar">
      <a className="skip-link" href="#browse">Skip to movies</a>
      <div className="container navbar__inner">
        <a
          href="#top"
          className="brand"
          onClick={(event) => {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        >
          <img src="/logo.webp" alt="" width="72" height="72" />
          <span className="brand__name">Cine<span>Search</span></span>
        </a>

        <nav className="navbar__links" aria-label="Primary">
          <button
            type="button"
            className={`nav-link ${mediaType === "movie" ? "is-active" : ""}`}
            aria-current={mediaType === "movie" ? "page" : undefined}
            onClick={() => {
              onMediaChange?.("movie");
              goTo("browse");
            }}
          >
            Movies
          </button>
          <button
            type="button"
            className={`nav-link ${mediaType === "tv" ? "is-active" : ""}`}
            aria-current={mediaType === "tv" ? "page" : undefined}
            onClick={() => {
              onMediaChange?.("tv");
              goTo("browse");
            }}
          >
            TV
          </button>
          <div className="navbar__genre-wrap" ref={genreRef}>
            <button
              type="button"
              className={`nav-link ${genreOpen ? "is-open" : ""}`}
              onClick={() => setGenreOpen((open) => !open)}
              aria-expanded={genreOpen}
              aria-haspopup="menu"
            >
              Genres
              <ChevronIcon />
            </button>
            {genreOpen ? (
              <div className="genre-menu" role="menu" aria-label="Browse by genre">
                <button
                  type="button"
                  role="menuitem"
                  className={`genre-menu__item ${!selectedGenre ? "is-active" : ""}`}
                  onClick={() => pickGenre("")}
                >
                  All genres
                </button>
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    type="button"
                    role="menuitem"
                    className={`genre-menu__item ${selectedGenre === genre.name ? "is-active" : ""}`}
                    onClick={() => pickGenre(genre.name)}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <button type="button" className="nav-link" onClick={() => goTo("trending")}>
            Trending
          </button>
          <button type="button" className="nav-link nav-link--watch" onClick={() => goTo("watchlist")}>
            Watchlist
            <span className="nav-count" aria-label={`${watchlistCount} saved`}>{watchlistCount}</span>
          </button>
        </nav>

        <div className="navbar__actions">
          <button type="button" className="navbar__surprise" onClick={onSurprise} aria-label="Surprise me with a random title">
            <SparkIcon />
          </button>
          <div className="navbar__search">
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} variant="compact" />
          </div>
          <button
            type="button"
            className="navbar__toggle"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="navbar__panel">
          <div className="container">
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            <nav className="navbar__panel-links" aria-label="Mobile navigation">
              <button
                type="button"
                className={`nav-link ${mediaType === "movie" ? "is-active" : ""}`}
                onClick={() => {
                  onMediaChange?.("movie");
                  goTo("browse");
                }}
              >
                Movies
              </button>
              <button
                type="button"
                className={`nav-link ${mediaType === "tv" ? "is-active" : ""}`}
                onClick={() => {
                  onMediaChange?.("tv");
                  goTo("browse");
                }}
              >
                TV
              </button>
              <button type="button" className="nav-link" onClick={() => goTo("trending")}>Trending</button>
              <button type="button" className="nav-link nav-link--watch" onClick={() => goTo("watchlist")}>
                <BookmarkIcon /> Watchlist
                <span className="nav-count">{watchlistCount}</span>
              </button>
            </nav>
            <p className="navbar__panel-label">Browse by genre</p>
            <div className="navbar__panel-genres">
              {genres.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  className={`chip ${selectedGenre === genre.name ? "is-active" : ""}`}
                  onClick={() => pickGenre(genre.name)}
                >
                  {genre.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
};

export default NavBar;
