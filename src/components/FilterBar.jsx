const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most popular" },
  { value: "vote_average.desc", label: "Top rated" },
  { value: "primary_release_date.desc", label: "Recently released" },
  { value: "revenue.desc", label: "Biggest box office" },
  { value: "title.asc", label: "Title A to Z" },
  { value: "title.desc", label: "Title Z to A" },
];

const RATING_OPTIONS = [
  { value: "", label: "Any rating" },
  { value: "9", label: "9+ only" },
  { value: "8", label: "8+ only" },
  { value: "7", label: "7+ only" },
  { value: "6", label: "6+ only" },
];

const DEFAULT_SORT = "popularity.desc";

const SortIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m3 8 4-4 4 4M7 4v16M21 16l-4 4-4-4M17 20V4" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 11h18" />
  </svg>
);

const ChevronIcon = () => (
  <svg className="filter-select__chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const ResetIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const StarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z" />
  </svg>
);

const FilterBar = ({
  genres = [],
  selectedGenre,
  setSelectedGenre,
  sortBy,
  setSortBy,
  selectedYear,
  setSelectedYear,
  minRating = "",
  setMinRating,
  mediaType = "movie",
  onSurprise,
}) => {
  const isTv = mediaType === "tv";
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear; year >= 1950; year -= 1) years.push(year);

  const sortOptions = SORT_OPTIONS.filter((option) => !(isTv && option.value === "revenue.desc")).map(
    (option) => {
      if (!isTv) return option;
      if (option.value === "primary_release_date.desc") return { ...option, label: "Recently aired" };
      if (option.value === "title.asc") return { ...option, label: "Title A to Z" };
      return option;
    }
  );

  const hasFilters =
    Boolean(selectedGenre) || Boolean(selectedYear) || Boolean(minRating) || sortBy !== DEFAULT_SORT;

  const resetFilters = () => {
    setSelectedGenre("");
    setSelectedYear("");
    setMinRating("");
    setSortBy(DEFAULT_SORT);
  };

  return (
    <div className="filterbar">
      <div className="filterbar__genres" role="group" aria-label="Filter by genre">
        <button
          type="button"
          className={`chip ${!selectedGenre ? "is-active" : ""}`}
          onClick={() => setSelectedGenre("")}
        >
          All
        </button>
        {genres.map((genre) => (
          <button
            key={genre.id}
            type="button"
            className={`chip ${selectedGenre === genre.name ? "is-active" : ""}`}
            onClick={() => setSelectedGenre(genre.name)}
          >
            {genre.name}
          </button>
        ))}
      </div>

      <div className="filterbar__selects">
        <label className="filter-select">
          <span className="filter-select__icon" aria-hidden="true"><SortIcon /></span>
          <span className="sr-only">Sort titles</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <ChevronIcon />
        </label>

        <label className="filter-select">
          <span className="filter-select__icon" aria-hidden="true"><CalendarIcon /></span>
          <span className="sr-only">{isTv ? "Filter by first air year" : "Filter by release year"}</span>
          <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)}>
            <option value="">All years</option>
            {years.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <ChevronIcon />
        </label>

        <label className="filter-select">
          <span className="filter-select__icon" aria-hidden="true"><StarIcon /></span>
          <span className="sr-only">Minimum rating</span>
          <select value={minRating} onChange={(event) => setMinRating(event.target.value)}>
            {RATING_OPTIONS.map((option) => (
              <option key={option.value || "any"} value={option.value}>{option.label}</option>
            ))}
          </select>
          <ChevronIcon />
        </label>

        {onSurprise ? (
          <button type="button" className="filter-surprise" onClick={onSurprise}>
            Surprise me
          </button>
        ) : null}

        {hasFilters ? (
          <button type="button" className="filter-reset" onClick={resetFilters}>
            <ResetIcon /> Reset
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default FilterBar;
