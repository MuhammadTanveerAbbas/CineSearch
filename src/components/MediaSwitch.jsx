const FilmIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="3" width="20" height="18" rx="2.5" />
    <path d="M7 3v18M17 3v18M2 12h20" />
  </svg>
);

const TvIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="7" width="20" height="14" rx="2.5" />
    <path d="m8 3 4 4 4-4" />
  </svg>
);

const MediaSwitch = ({ mediaType, onChange, compact = false }) => {
  const options = [
    { value: "movie", label: "Movies", Icon: FilmIcon },
    { value: "tv", label: "TV shows", Icon: TvIcon },
  ];

  return (
    <div className={`media-switch ${compact ? "media-switch--compact" : ""}`} role="group" aria-label="Choose media type">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={mediaType === option.value}
          className={`media-switch__btn ${mediaType === option.value ? "is-active" : ""}`}
          onClick={() => onChange(option.value)}
        >
          <option.Icon />
          {option.label}
        </button>
      ))}
    </div>
  );
};

export default MediaSwitch;
