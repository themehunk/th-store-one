const ArchiveStyle1 = ({ settings = {} }) => {

  const sold = 32;
  const total = 50;
  const percent = (sold / total) * 100;

  // STATIC TIME (no calculation)
  const time = {
    d: "02",
    h: "05",
    m: "12",
    s: "33",
  };

  return (
    <div className="s1-ac-style1">

      <div className="s1-ac-msg">
        Hurry! Only few left
      </div>

      <div className="s1-ac-timer">
        {time.d}d : {time.h}h : {time.m}m : {time.s}s
      </div>

      <div className="s1-ac-stock">
        {sold} sold • {total - sold} left
      </div>

      <div className="s1-ac-bar">
        <div
          className="s1-ac-fill"
          style={{ width: `${percent}%` }}
        />
      </div>

    </div>
  );
};

export default ArchiveStyle1;