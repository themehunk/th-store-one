const ArchiveStyle3 = ({ settings = {} }) => {

  const sold = 32;
  const total = 50;
  const percent = (sold / total) * 100;

  const time = {
    d: "02",
    h: "05",
    m: "12",
    s: "33",
  };

  return (
    <div className="s1-ac-style3">

      {/* MESSAGE */}
      <div className="s1-ac3-msg">
        Hurry! Only few left
      </div>

      {/* TIMER (BOX STYLE) */}
      <div className="s1-ac3-timer">

        <div className="s1-ac3-box">
          <span>{time.d}</span>
          <small>D</small>
        </div>

        <div className="s1-ac3-box">
          <span>{time.h}</span>
          <small>H</small>
        </div>

        <div className="s1-ac3-box">
          <span>{time.m}</span>
          <small>M</small>
        </div>

        <div className="s1-ac3-box">
          <span>{time.s}</span>
          <small>S</small>
        </div>

      </div>

      {/* STOCK */}
      <div className="s1-ac3-stock">
        {sold} sold • {total - sold} left
      </div>

      {/* BAR */}
      <div className="s1-ac3-bar">
        <div
          className="s1-ac3-fill"
          style={{ width: `${percent}%` }}
        />
      </div>

    </div>
  );
};

export default ArchiveStyle3;