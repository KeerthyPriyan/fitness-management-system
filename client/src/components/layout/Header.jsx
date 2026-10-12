import { Link, useLocation } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { navItems } from "../../constants/navItems.js";

export default function Header() {
  const { pathname } = useLocation();
  const current = navItems.find((item) => item.to === pathname);
  const title = current ? current.label : "Page not found";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <header className="topbar">
      <div className="topbar-title">
        <span className="brand-mark topbar-brand">
          <Dumbbell size={20} aria-hidden="true" />
        </span>
        <h1>{title}</h1>
      </div>
      <div className="topbar-right">
        <span className="topbar-date">{today}</span>
        <Link to="/profile" className="avatar" aria-label="Open profile">
          AM
        </Link>
      </div>
    </header>
  );
}
