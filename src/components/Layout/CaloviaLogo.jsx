import { Link } from "react-router-dom";
import logoSrc from "../../../calovia-logo.png";

export default function CaloviaLogo({
  to = "/",
  link = true,
  className = "",
  showText = true,
  imageClassName = "h-20 w-20",
}) {
  const content = (
    <>
      <img
        src={logoSrc}
        alt="Calovia"
        className={`shrink-0 object-contain ${imageClassName}`}
      />
      {showText && (
        <span className="font-bold text-gray-900 text-lg tracking-tight">
          Calovia
        </span>
      )}
    </>
  );

  const wrapperClass = `flex items-center gap-2 ${className}`;

  if (link && to) {
    return (
      <Link to={to} className={wrapperClass}>
        {content}
      </Link>
    );
  }

  return <div className={wrapperClass}>{content}</div>;
}
