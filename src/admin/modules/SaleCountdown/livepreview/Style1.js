const Style1 = ({ settings }) => {

  const sold = 32;
  const total = 50;
  const percent = (sold / total) * 100;

  return (
    <div className="s1-style s1-default-pro">

      {/* TOP MESSAGE */}
      <div className="s1-top">
        Hurry! Only few left in stock
      </div>

      {/* TIMER */}
      <div className="s1-timer">
        <div><span>05</span><small>HRS</small></div>
        <div><span>12</span><small>MIN</small></div>
        <div><span>33</span><small>SEC</small></div>
      </div>

      {/* STOCK INFO */}
      <div className="s1-stock-info">
        <span>{sold} sold</span>
        <span>{total - sold} left</span>
      </div>

      {/* PROGRESS BAR */}
      <div className="s1-stock-bar">
        <div
          className="s1-progress"
          style={{ width: `${percent}%` }}
        ></div>
      </div>

    </div>
  );
};

export default Style1;