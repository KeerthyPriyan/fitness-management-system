import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Header from "./Header.jsx";
import MobileNav from "./MobileNav.jsx";

export default function Layout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="app-content">
          {/* The current page is rendered here */}
          <Outlet />
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
