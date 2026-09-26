const ModuleGridSkeleton = () => {
  return (
    <div className="s1-module-grid-skeleton">
      {/* Top */}
      <div className="s1-module-grid-skeleton__top">
        <div>
          <div className="s1-skeleton s1-skeleton--heading"></div>
          <div className="s1-skeleton s1-skeleton--subheading"></div>
          <div className="s1-skeleton s1-skeleton--subheading short"></div>
        </div>

        <div className="s1-module-grid-skeleton__right">
          <div className="s1-skeleton s1-skeleton--search"></div>

          <div className="s1-module-grid-skeleton__counts">
            <div className="s1-skeleton s1-skeleton--count"></div>
            <div className="s1-skeleton s1-skeleton--count"></div>
            <div className="s1-skeleton s1-skeleton--count"></div>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="s1-module-grid-skeleton__grid">
        {Array.from({ length: 9 }).map((_, index) => (
          <div className="s1-module-skeleton-card" key={index}>
            <div className="s1-module-skeleton-card__top">
              <div className="s1-skeleton s1-skeleton--icon"></div>

              <div>
                <div className="s1-skeleton s1-skeleton--status"></div>
                <div className="s1-skeleton s1-skeleton--free"></div>
              </div>
            </div>

            <div className="s1-skeleton s1-skeleton--card-title"></div>

            <div className="s1-skeleton s1-skeleton--line"></div>
            <div className="s1-skeleton s1-skeleton--line"></div>
            <div className="s1-skeleton s1-skeleton--line short"></div>

            <div className="s1-skeleton s1-skeleton--configure"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModuleGridSkeleton;
