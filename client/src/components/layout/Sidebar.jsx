import { NavLink } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { navItems } from "../../constants/navItems.js";

// Visible on desktop only (hidden below 900px in layout.css)
export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-mark">
          <Dumbbell size={20} aria-hidden="true" />
        </span>
        <span className="brand-name">FitTrack</span>
      </div>

      <nav aria-label="Main navigation">
        <ul className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={to === "/"}
                className={({ isActive }) => "sidebar-link" + (isActive ? " active" : "")}
              >
                <Icon size={20} aria-hidden="true" />
                <span>{label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <p className="sidebar-note">Small sessions add up. Keep showing up.</p>
    </aside>
  );
}
