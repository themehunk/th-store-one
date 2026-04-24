import { useRef, useEffect } from "@wordpress/element";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { S1Field } from "@th-storeone-global/S1Field";

const S1DateTimePicker = ({
  value,
  onChange,
  label,
  placeholder,
  minDate = null,
}) => {
  const inputRef = useRef(null);
  const pickerInstance = useRef(null);

  useEffect(() => {
    if (!inputRef.current) return;

    const defaultVal = value ? value : new Date();

    pickerInstance.current = flatpickr(inputRef.current, {
      enableTime: true,
      dateFormat: "Y-m-d H:i",
      time_24hr: true,
      defaultDate: defaultVal,
      minDate: minDate || "today", // 🔥 prevent past
      clickOpens: true,
      allowInput: true,

      onChange: (selectedDates, dateStr) => {
        onChange(dateStr);
      },
    });

    return () => {
      pickerInstance.current?.destroy();
    };
  }, [minDate]);

  return (
    <S1Field label={label}>
      <input
        ref={inputRef}
        defaultValue={value || ""}
        placeholder={placeholder || "Select date & time"}
        className="s1-input"
        onFocus={() => pickerInstance.current?.open()}
      />
    </S1Field>
  );
};

export default S1DateTimePicker;