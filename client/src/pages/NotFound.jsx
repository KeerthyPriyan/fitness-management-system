import { Link } from "react-router-dom";
import { SearchX } from "lucide-react";
import PlaceholderPage from "../components/ui/PlaceholderPage.jsx";

export default function NotFound() {
  return (
    <>
      <PlaceholderPage
        icon={SearchX}
        title="We can't find that page"
        description="The link may be broken or the page may have moved."
      />
      <p className="back-link">
        <Link to="/" className="panel-link">
          Go to the dashboard
        </Link>
      </p>
    </>
  );
}
