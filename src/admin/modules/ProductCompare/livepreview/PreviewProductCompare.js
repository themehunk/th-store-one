import "./live-style.css";
import { __ } from "@wordpress/i18n";

const PreviewProductCompare = ({ settings = {} }) => {
  const style = "";

  const changeStyle = (value) => {
    window.dispatchEvent(
      new CustomEvent("storeone:changeProductCompareStyle", {
        detail: { style: value },
      }),
    );
  };

  return <div className="s1-ntf-preview-wrap"></div>;
};

export default PreviewProductCompare;
