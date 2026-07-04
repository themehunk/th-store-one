import { useState } from "@wordpress/element";

/* ---------------------------------
 * Click-to-copy shortcode tag grid
 * --------------------------------- */
export default function S1ShortcodeTags({ tags = [] }) {
  const [copied, setCopied] = useState("");

  const copy = (tag) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(tag);
    }
    setCopied(tag);
    setTimeout(() => setCopied(""), 1200);
  };

  return (
    <div className="s1-shortcode-tags">
      {tags.map((t) => (
        <div
          key={t.tag}
          className="s1-shortcode-tag"
          title="Click to copy"
          onClick={() => copy(t.tag)}
        >
          <strong>{copied === t.tag ? "Copied!" : t.tag}</strong>
          <span>{t.label}</span>
        </div>
      ))}
    </div>
  );
}
