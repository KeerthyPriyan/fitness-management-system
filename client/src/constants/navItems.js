import { LayoutDashboard, Dumbbell, Target, Scale, User } from "lucide-react";

// One list drives the sidebar, the mobile nav and the page title
export const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/workouts", label: "Workouts", icon: Dumbbell },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/weight", label: "Weight", icon: Scale },
  { to: "/profile", label: "Profile", icon: User },
];
