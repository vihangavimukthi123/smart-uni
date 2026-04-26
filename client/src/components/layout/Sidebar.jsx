import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MdDashboard, MdMeetingRoom, MdEvent, MdCalendarMonth,
  MdBarChart, MdNotifications, MdPeople, MdLogout,
  MdChevronLeft, MdChevronRight, MdSchool, MdChat, MdPerson, MdAnalytics, MdHistory,
  MdTaskAlt, MdLibraryBooks
} from 'react-icons/md';

const adminNav = [
  { section: 'Main Control', items: [
    { label: 'Admin Dashboard', to: '/admin', icon: <MdDashboard />, end: true },
    { label: 'Manage Rooms', to: '/admin/rooms', icon: <MdMeetingRoom /> },
    { label: 'Event Requests', to: '/admin/events', icon: <MdEvent /> },
    { label: 'Schedule Matrix', to: '/admin/schedules', icon: <MdCalendarMonth /> },
    { label: 'User Mgt', to: '/admin/users', icon: <MdPeople /> },
    { label: 'Support Messages', to: '/messages', icon: <MdChat /> },
  ]},
  { section: 'Rental Admin', items: [
    { label: 'Products', to: '/admin/rental/products', icon: <MdPeople /> },
    { label: 'Orders', to: '/admin/rental/orders', icon: <MdHistory /> },
    { label: 'Packages', to: '/admin/rental/packages', icon: <MdDashboard /> },
    { label: 'Offers', to: '/admin/rental/offers', icon: <MdBarChart /> },
    { label: 'Reviews', to: '/admin/rental/reviews', icon: <MdBarChart /> },
  ]},
  { section: 'Learning Admin', items: [
    { label: 'Dashboard', to: '/learning', icon: <MdSchool /> },
    { label: 'Resources', to: '/learning/resources', icon: <MdLibraryBooks /> },
    { label: 'Task Board', to: '/learning/tasks', icon: <MdTaskAlt /> },
    { label: 'Peers', to: '/learning/peers', icon: <MdPeople /> },
  ]},
  { section: 'Momentum', items: [
    { label: "Dashboard", to: "/momentum", icon: <MdDashboard /> },
    { label: "Study Tracker", to: "/momentum/tracker", icon: <MdBarChart /> },
    { label: "Learning Journal", to: "/momentum/learning-journal", icon: <MdChat /> },
    { label: "Generate Workplan", to: "/momentum/workplan", icon: <MdEvent /> },
    { label: "Academic Vault", to: "/momentum/vault", icon: <MdSchool /> },
    { label: "FAQs", to: "/momentum/faqs", icon: <MdHistory /> },
  ]}
];

const studentNav = [
  { section: 'Main Control', items: [
    { label: 'My Dashboard', to: '/dashboard', icon: <MdDashboard />, end: true },
    { label: 'My Schedule', to: '/dashboard/schedule', icon: <MdCalendarMonth /> },
    { label: 'Event Requests', to: '/dashboard/requests', icon: <MdEvent /> },
    { label: 'Support Messages', to: '/messages', icon: <MdChat /> },
  ]},
  { section: 'Rental Store', items: [
    { label: 'Browse Rentals', to: '/rental/items', icon: <MdDashboard /> },
    { label: 'Bundles & Deals', to: '/rental/packages', icon: <MdDashboard /> },
    { label: 'Special Offers', to: '/rental/offers', icon: <MdBarChart /> },
    { label: 'My Cart', to: '/rental/cart', icon: <MdDashboard /> },
    { label: 'Kit Generator', to: '/rental/kit-generator/input', icon: <MdDashboard /> },
    { label: 'Order History', to: '/rental/history', icon: <MdHistory /> },
  ]},
  { section: 'Learning Hub', items: [
    { label: 'Learning Dash', to: '/learning', icon: <MdDashboard /> },
    { label: 'Find Peers', to: '/learning/peers', icon: <MdPeople /> },
    { label: 'Tasks', to: '/learning/tasks', icon: <MdTaskAlt /> },
    { label: 'Resources', to: '/learning/resources', icon: <MdLibraryBooks /> },
    { label: 'My Activity', to: '/learning/activity', icon: <MdHistory /> },
  ]},
  { section: 'Momentum', items: [
    { label: "Dashboard", to: "/momentum", icon: <MdDashboard /> },
    { label: "Study Tracker", to: "/momentum/tracker", icon: <MdBarChart /> },
    { label: "Learning Journal", to: "/momentum/learning-journal", icon: <MdChat /> },
    { label: "Generate Workplan", to: "/momentum/workplan", icon: <MdEvent /> },
    { label: "Academic Vault", to: "/momentum/vault", icon: <MdSchool /> },
    { label: "FAQs", to: "/momentum/faqs", icon: <MdHistory /> },
  ]}
];

const supplierNav = [
  { section: 'Supplier Portal', items: [
    { label: 'My Products', to: '/supplier', icon: <MdDashboard />, end: true },
    { label: 'My Packages', to: '/supplier/packages', icon: <MdDashboard /> },
    { label: 'Special Offers', to: '/supplier/offers', icon: <MdBarChart /> },
    { label: 'Manage Orders', to: '/supplier/orders', icon: <MdHistory /> },
    { label: 'Reviews', to: '/supplier/reviews', icon: <MdBarChart /> },
    { label: 'Profile Settings', to: '/supplier/users', icon: <MdPerson /> },
    { label: 'Messages', to: '/messages', icon: <MdChat /> },

  ]}
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, isAdmin, isSupplier, isAdminOrScheduler } = useAuth();
  
  let navSections = studentNav;
  if (isAdminOrScheduler) {
    navSections = adminNav;
  } else if (isSupplier) {
    navSections = supplierNav;
  }


  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <img src="/logo.png" alt="Logo" style={{ width: 32, height: 32, borderRadius: 6 }} />
        {!collapsed && (
          <div className="sidebar-brand">
            MATRIX CORP
            <span>Unified Platform</span>
          </div>
        )}
        <button
          onClick={onToggle}
          className="btn btn-ghost btn-icon"
          style={{ marginLeft: 'auto', fontSize: '1.2rem', color: 'var(--text-muted)' }}
        >
          {collapsed ? <MdChevronRight /> : <MdChevronLeft />}
        </button>
      </div>

      <nav className="sidebar-nav" style={{ overflowY: 'auto', paddingBottom: '2rem' }}>
        {navSections.map((section, sidx) => (
          <div key={sidx} style={{ marginBottom: collapsed ? '0.5rem' : '1.5rem' }}>
            {!collapsed && (
               <div className="nav-section-title" style={{ fontSize: '0.7rem', opacity: 0.7, padding: '0 1rem', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
                  {section.section}
               </div>
            )}
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
                title={collapsed ? item.label : undefined}
              >
                <span className="nav-item-icon">{item.icon}</span>
                {!collapsed && item.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div className="avatar" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
              {user?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="truncate" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.name}</div>
              <div className="truncate" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{user?.role}</div>
            </div>
          </div>
        )}
        <button onClick={logout} className="btn btn-ghost btn-sm w-full" style={{ justifyContent: collapsed ? 'center' : 'flex-start' }}>
          <MdLogout />
          {!collapsed && 'Sign Out'}
        </button>
      </div>
    </aside>
  );
}
