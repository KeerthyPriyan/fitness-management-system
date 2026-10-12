import { NavLink } from "react-router-dom";
import { navItems } from "../../constants/navItems.js";

// Bottom tab bar, visible on phones and tablets only
export default function MobileNav() {
  return (
    <nav className="bottom-nav" aria-label="Mobile navigation">
      <ul>
        {navItems.map(({ to, label, icon: Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === "/"}
              className={({ isActive }) => "bottom-link" + (isActive ? " active" : "")}
            >
              <Icon size={22} aria-hidden="true" />
              <span>{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
