import { Icon, mobile, tablet, desktop } from "@wordpress/icons";

export default function DeviceSelector({
  value = [],
  onChange,
}) {
  const devices = [
    { id: "desktop", icon: <Icon icon={desktop} />, label: "Desktop" },
    { id: "tablet", icon: <Icon icon={tablet} />, label: "Tablet" },
    { id: "mobile", icon: <Icon icon={mobile} />, label: "Mobile" },
  ];

  const toggleDevice = (id) => {
    let newValue;

    if (value.includes(id)) {
      newValue = value.filter((v) => v !== id);
    } else {
      newValue = [...value, id];
    }

    onChange(newValue);
  };

  return (
    <div className="s1-device-selector">
      {devices.map((d) => (
        <button
          key={d.id}
          type="button"
          className={`s1-device-btn ${
            value.includes(d.id) ? "active" : ""
          }`}
          onClick={() => toggleDevice(d.id)}
        >
          <span className="s1-device-icon">{d.icon}</span>
          <span className="s1-device-label">{d.label}</span>
        </button>
      ))}
    </div>
  );
}