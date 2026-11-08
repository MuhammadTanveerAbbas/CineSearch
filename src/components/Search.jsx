const SearchIcon = () => (
  <svg className="search__icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

const ClearIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const Search = ({ searchTerm, setSearchTerm, variant = "default", placeholder }) => {
  const isCompact = variant === "compact";
  const resolvedPlaceholder =
    placeholder || (isCompact ? "Search titles…" : "Search movies, shows, people…");

  return (
    <div className={`search ${isCompact ? "search--compact" : "search--hero"}`}>
      <SearchIcon />
      <input
        type="search"
        placeholder={resolvedPlaceholder}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        aria-label="Search the catalogue"
        autoComplete="off"
        spellCheck="false"
      />
      {searchTerm ? (
        <button
          type="button"
          className="search__clear"
          onClick={() => setSearchTerm("")}
          aria-label="Clear search"
        >
          <ClearIcon />
        </button>
      ) : (
        <span className="search__hint" aria-hidden="true">/</span>
      )}
    </div>
  );
};

export default Search;
