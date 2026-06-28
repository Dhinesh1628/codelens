import {
  Home,
  FileCode,
  Settings,
  Github,
} from "lucide-react";

import "./Sidebar.css";

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">
        {"</>"} CodeLens
      </div>

      <button className="new-review">
        New Review
      </button>

      <nav>
        <a href="#">
          <Home size={18} />
          Dashboard
        </a>

        <a href="#">
          <FileCode size={18} />
          My Reviews
        </a>

        <a href="#">
          <Settings size={18} />
          Settings
        </a>

        <a href="#">
          <Github size={18} />
          GitHub Repo
        </a>
      </nav>
    </aside>
  );
}