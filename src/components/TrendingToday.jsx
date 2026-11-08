import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const TMDB_IMAGE = "https://image.tmdb.org/t/p/w342";
const FALLBACK_POSTER = "/no-movie.webp";
const SCROLL_EASE_MS = 420;

function isRecentlyAdded(releaseDate) {
  if (!releaseDate) return false;
  const released = new Date(releaseDate);
  if (Number.isNaN(released.getTime())) return false;
  const days = (Date.now() - released.getTime()) / (1000 * 60 * 60 * 24);
  return days >= 0 && days <= 30;
}

function getYear(releaseDate) {
  if (!releaseDate) return null;
  const year = String(releaseDate).split("-")[0];
  return year && year.length === 4 ? year : null;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

const ChevronIcon = ({ direction = "right" }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={direction === "left" ? "m15 18-6-6 6-6" : "m9 18 6-6-6-6"} />
  </svg>
);

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

function TrendingSkeleton() {
  return (
    <section className="trending is-visible" aria-label="Trending today loading">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="skeleton-line skeleton-line--eyebrow" aria-hidden="true" />
            <div className="skeleton-line skeleton-line--title" aria-hidden="true" />
          </div>
        </div>
        <div className="trending__skeleton-row" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="trending__skeleton-item">
              <div className="trending__skeleton-poster" />
              <div className="trending__skeleton-info" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PosterImage({ src, alt = "", onError }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const finalSrc = !src || failed ? FALLBACK_POSTER : src;

  return (
    <img
      className={`trending__poster-img ${loaded ? "is-loaded" : ""}`}
      src={finalSrc}
      alt={alt}
      loading="lazy"
      decoding="async"
      width="342"
      height="513"
      onLoad={() => setLoaded(true)}
      onError={(event) => {
        if (!failed) {
          setFailed(true);
          setLoaded(false);
          onError?.(event);
        }
      }}
    />
  );
}

const TrendingToday = ({ movies = [], onSelectMovie, isLoading = false, genres = [], title = "Trending today", subtitle = "The titles everyone is watching right now." }) => {
  const listRef = useRef(null);
  const sectionRef = useRef(null);
  const rafRef = useRef(0);
  const dragRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startScroll: 0,
    moved: false,
    lastX: 0,
    lastT: 0,
    velocity: 0,
  });

  const [isDragging, setIsDragging] = useState(false);
  const [hasEntered, setHasEntered] = useState(true);
  const [imgErrors, setImgErrors] = useState({});

  const safeMovies = useMemo(() => {
    if (!Array.isArray(movies)) return [];
    const seen = new Set();
    return movies.filter((movie) => {
      if (!movie || movie.id == null) return false;
      if (seen.has(movie.id)) return false;
      seen.add(movie.id);
      return true;
    });
  }, [movies]);

  const updateArrows = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
  }, []);

  const scheduleArrowUpdate = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(updateArrows);
  }, [updateArrows]);

  useEffect(() => {
    scheduleArrowUpdate();
    const el = listRef.current;
    if (!el) return undefined;
    const onScroll = () => scheduleArrowUpdate();
    el.addEventListener("scroll", onScroll, { passive: true });
    const observer = new ResizeObserver(() => scheduleArrowUpdate());
    observer.observe(el);
    Array.from(el.children).forEach((child) => observer.observe(child));
    window.addEventListener("resize", scheduleArrowUpdate);
    return () => {
      el.removeEventListener("scroll", onScroll);
      observer.disconnect();
      window.removeEventListener("resize", scheduleArrowUpdate);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [safeMovies, scheduleArrowUpdate]);

  useEffect(() => {
    if (hasEntered) return undefined;
    const section = sectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setHasEntered(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, [hasEntered]);

  const scrollByAmount = useCallback((direction) => {
    const el = listRef.current;
    if (!el) return;
    const first = el.querySelector(".trending__item");
    const gap = parseFloat(getComputedStyle(el).columnGap || getComputedStyle(el).gap || "20") || 20;
    const itemWidth = first ? first.getBoundingClientRect().width : Math.min(240, el.clientWidth * 0.4);
    const scrollAmount = (itemWidth + gap) * 2;
    const newScrollLeft = el.scrollLeft + direction * scrollAmount;
    el.scrollTo({ left: newScrollLeft, behavior: "smooth" });
    setTimeout(updateArrows, 450);
  }, [updateArrows]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollByAmount(-1);
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollByAmount(1);
      }
    },
    [scrollByAmount]
  );

  useEffect(() => {
    const el = listRef.current;
    if (!el) return undefined;
    const onWheel = (event) => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
        const canMove = (event.deltaY < 0 && el.scrollLeft > 0) || (event.deltaY > 0 && el.scrollLeft < maxScroll);
        if (canMove) {
          event.preventDefault();
          el.scrollLeft += event.deltaY;
        }
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [safeMovies.length]);

  const onPointerDown = useCallback((event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    // Don't start drag if clicking on a button or interactive element
    if (event.target.closest('button, a, input, select, textarea')) {
      return;
    }
    const el = listRef.current;
    if (!el) return;
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScroll: el.scrollLeft,
      moved: false,
      lastX: event.clientX,
      lastT: performance.now(),
      velocity: 0,
    };
    if (event.pointerType === "mouse") {
      el.setPointerCapture(event.pointerId);
      setIsDragging(true);
    }
  }, []);

  const onPointerMove = useCallback((event) => {
    const drag = dragRef.current;
    const el = listRef.current;
    if (!drag.active || !el || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    if (Math.abs(dx) > 8) drag.moved = true;
    if (drag.moved && event.pointerType === "mouse") {
      event.preventDefault();
      const now = performance.now();
      const dt = Math.max(1, now - drag.lastT);
      drag.velocity = (event.clientX - drag.lastX) / dt;
      drag.lastX = event.clientX;
      drag.lastT = now;
      el.scrollLeft = drag.startScroll - dx;
    }
  }, []);

  const endDrag = useCallback((event) => {
    const drag = dragRef.current;
    const el = listRef.current;
    if (!drag.active || (event && drag.pointerId !== event.pointerId)) return;
    if (el && drag.pointerId != null && event?.pointerType === "mouse") {
      try {
        el.releasePointerCapture(drag.pointerId);
      } catch {
        // Pointer capture may already be released.
      }
    }
    if (el && drag.moved && Math.abs(drag.velocity) > 0.15) {
      const distance = clamp(drag.velocity * -SCROLL_EASE_MS * 0.35, -320, 320);
      el.scrollBy({ left: distance, behavior: "smooth" });
    }
    const wasMoved = drag.moved;
    dragRef.current.active = false;
    dragRef.current.pointerId = null;
    setIsDragging(false);
    if (wasMoved) {
      setTimeout(() => {
        dragRef.current.moved = false;
      }, 50);
    } else {
      dragRef.current.moved = false;
    }
  }, []);

  const handleItemClick = useCallback(
    (movie, event) => {
      if (dragRef.current.moved) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      if (onSelectMovie) {
        onSelectMovie(movie);
      }
    },
    [onSelectMovie]
  );

  if (isLoading) return <TrendingSkeleton />;

  if (safeMovies.length === 0) {
    return (
      <section id="trending" className="trending is-visible" aria-label="Trending today">
        <div className="container">
          <div className="section-head">
            <div>
              <p className="eyebrow">Live now</p>
              <h2 className="section-title">{title}</h2>
            </div>
          </div>
          <div className="empty-state" role="status">
            <p className="empty-state__title">Nothing is trending yet</p>
            <p className="empty-state__text">Check back in a little while for today&apos;s most watched titles.</p>
          </div>
        </div>
      </section>
    );
  }

  const showNav = safeMovies.length > 3;

  return (
    <section
      id="trending"
      ref={sectionRef}
      className={`trending ${hasEntered ? "is-visible" : ""}`}
      aria-label="Trending today"
    >
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Live now</p>
            <h2 className="section-title">{title}</h2>
            <p className="section-sub">{subtitle}</p>
          </div>
          {showNav ? (
            <div className="carousel-nav" aria-label="Carousel navigation">
              <button
                type="button"
                className="carousel-nav__btn"
                onClick={() => scrollByAmount(-1)}
                aria-label="Scroll trending left"
              >
                <ChevronIcon direction="left" />
              </button>
              <button
                type="button"
                className="carousel-nav__btn"
                onClick={() => scrollByAmount(1)}
                aria-label="Scroll trending right"
              >
                <ChevronIcon />
              </button>
            </div>
          ) : null}
        </div>

        <ul
          ref={listRef}
          className={`trending__list ${isDragging ? "is-dragging" : ""}`}
          tabIndex={0}
          aria-label="Trending movies"
          onKeyDown={handleKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onPointerLeave={endDrag}
        >
          {safeMovies.map((movie, index) => {
            const rank = index + 1;
            const title = movie.title || movie.name || "Untitled";
            const year = getYear(movie.release_date || movie.first_air_date);
            const hasRating = typeof movie.vote_average === "number" && movie.vote_average > 0;
            const rating = hasRating ? movie.vote_average.toFixed(1) : null;
            const posterSrc = movie.poster_path ? `${TMDB_IMAGE}${movie.poster_path}` : FALLBACK_POSTER;
            const recent = isRecentlyAdded(movie.release_date || movie.first_air_date);
            const genreNames = Array.isArray(movie.genre_ids)
              ? movie.genre_ids
                  .map((genreId) => genres.find((genre) => genre.id === genreId)?.name)
                  .filter(Boolean)
                  .slice(0, 2)
              : [];
            const meta = [year, genreNames[0]].filter(Boolean).join(" · ");

            return (
              <li
                key={movie.id}
                className="trending__item"
                style={{ "--rank-index": index }}
              >
                <button
                  type="button"
                  className="trending__card"
                  aria-label={`Open details for ${title}, ranked ${rank}${recent ? ", new this month" : ""}`}
                  onClick={(event) => handleItemClick(movie, event)}
                >
                  <div className="trending__poster">
                    <span className="trending__rank" aria-hidden="true">
                      {String(rank).padStart(2, "0")}
                    </span>
                    <PosterImage
                      src={imgErrors[movie.id] ? FALLBACK_POSTER : posterSrc}
                      onError={() => setImgErrors((prev) => (prev[movie.id] ? prev : { ...prev, [movie.id]: true }))}
                    />
                    {recent ? <span className="trending__badge">New</span> : null}
                    {rating ? (
                      <span className="trending__rating" aria-label={`Rated ${rating} out of 10`}>
                        <img src="/star.svg" alt="" aria-hidden="true" />
                        {rating}
                      </span>
                    ) : null}
                    <span className="trending__cue" aria-hidden="true"><ArrowIcon /></span>
                  </div>
                  <div className="trending__info">
                    <span className="trending__title" title={title}>{title}</span>
                    {meta ? <span className="trending__meta">{meta}</span> : null}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
};

export default TrendingToday;
