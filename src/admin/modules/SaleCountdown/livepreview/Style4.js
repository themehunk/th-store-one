const Style4 = ({ settings }) => {
  return (
    <div className="s1-style s1-urgency">
      <div className="s1-top">
        Only few items left!
      </div>

      <div className="s1-timer">
        <span>05h</span>
        <span>12m</span>
        <span>33s</span>
      </div>

      <div className="s1-stock-bar">
        <div className="s1-progress" style={{ width: "75%" }}></div>
      </div>
    </div>
  );
};

export default Style4;