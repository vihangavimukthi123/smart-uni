import { NavLink } from "react-router-dom";
import "./Sidebar.css";

const navItems = [
  { label: "Dashboard", icon: "⊞", path: "/" },
  { label: "Peer Skill Sharing", icon: "👥", path: "/peers" },
  { label: "Micro Tasks", icon: "📋", path: "/tasks" },
  { label: "Resource Hub", icon: "📚", path: "/resources" },
  // { label: "Profile", icon: "👤", path: "/profile" },
  { label: "My Activity", icon: "👤", path: "/myactivity"}
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3z" />
            <path d="M5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z" />
          </svg>
        </div>
        <div>
          <div className="sidebar-logo-title">Learning Hub</div>
          {/* <div className="sidebar-logo-sub">Peer Skill Sharing</div> */}
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.label}
            className={({ isActive }) => 
              `sidebar-nav-item ${isActive ? "sidebar-nav-item--active" : ""}`
            }
            to={item.path}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="sidebar-user-avatar">SS</div>
        <div>
          <div className="sidebar-user-name">Shanilka Samarakoon</div>
          <div className="sidebar-user-dept">Infromation Technology</div>
        </div>
      </div>
    </aside>
  );
}