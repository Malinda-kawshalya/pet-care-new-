export default function SectionHeader({ eyebrow, title, text, align = "left" }) {
  return (
    <div className={`section-header ${align === "center" ? "section-header-center" : ""}`}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}
