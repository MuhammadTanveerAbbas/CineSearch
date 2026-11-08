const ArrowUpIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);

const QuoteIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M7.5 6C5 6 3 8 3 10.5S5 15 7.5 15c.4 0 .8 0 1.2-.1-.6 1.9-2.2 3.3-4.1 3.6L4.8 21c3.9-.6 6.7-4 6.7-8.4V10.5C11.5 8 9.9 6 7.5 6Zm9 0C14 6 12 8 12 10.5S14 15 16.5 15c.4 0 .8 0 1.2-.1-.6 1.9-2.2 3.3-4.1 3.6l.2 2.5c3.9-.6 6.7-4 6.7-8.4V10.5C20.5 8 18.9 6 16.5 6Z" />
  </svg>
);

const Footer = ({
  genres = [],
  watchlistCount = 0,
  quote,
  onBrowse,
  onSelectGenre,
  onSection,
  onTop,
}) => (
  <footer className="footer">
    <div className="container">
      <div className="footer__top">
        <div className="footer__brand-col">
          <a
            className="footer__brand"
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              onTop();
            }}
          >
            <img src="/logo.webp" alt="" width="44" height="44" />
            <span className="footer__name">CineSearch</span>
          </a>
          <p className="footer__note">
            An open movie and TV directory. Search the catalogue, follow what is trending,
            and keep a watchlist on this device.
          </p>
          <span className="footer__badge">Open data · No account required</span>
        </div>

        <nav className="footer__col" aria-label="Browse">
          <h3>Browse</h3>
          <button type="button" className="footer__link" onClick={() => onBrowse("movie")}>
            Movies
          </button>
          <button type="button" className="footer__link" onClick={() => onBrowse("tv")}>
            TV shows
          </button>
          <button type="button" className="footer__link" onClick={() => onSection("trending")}>
            Trending today
          </button>
          <button type="button" className="footer__link" onClick={() => onSection("watchlist")}>
            Watchlist <span className="footer__count">{watchlistCount}</span>
          </button>
        </nav>

        <nav className="footer__col" aria-label="Genres">
          <h3>Genres</h3>
          {genres.slice(0, 5).map((genre) => (
            <button
              key={genre.id}
              type="button"
              className="footer__link"
              onClick={() => onSelectGenre(genre.name)}
            >
              {genre.name}
            </button>
          ))}
          {genres.length === 0 ? <span className="footer__muted">Loading genres…</span> : null}
        </nav>

        <div className="footer__col footer__quote">
          <h3><QuoteIcon /> Intermission</h3>
          <blockquote>
            {quote?.content || "Cinema is a matter of what's in the frame and what's out."}
          </blockquote>
          <cite>{quote?.author || "Martin Scorsese"}</cite>
          <a
            className="footer__source"
            href="https://freeapi.app/"
            target="_blank"
            rel="noreferrer"
          >
            Quote via FreeAPI (MIT)
          </a>
        </div>
      </div>

      <div className="footer__bottom">
        <p className="footer__copyright">
          <strong>© 2026 CineSearch. Metadata and artwork from TMDB. This product uses the TMDB API but is not endorsed or certified by TMDB.</strong>
        </p>
        <div className="footer__bottom-links">
          <a href="https://muhammadtanveerabbas.vercel.app" target="_blank" rel="noreferrer">Made By Tanveer</a>
          <a href="https://react.dev" target="_blank" rel="noreferrer">React</a>
          <a href="https://vite.dev" target="_blank" rel="noreferrer">Vite</a>
          <a href="https://tailwindcss.com" target="_blank" rel="noreferrer">Tailwind CSS</a>
          <a href="https://github.com/hiteshchoudhary/apihub" target="_blank" rel="noreferrer">FreeAPI</a>
          <button type="button" className="footer__top-btn" onClick={onTop}>
            <ArrowUpIcon /> Top
          </button>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
