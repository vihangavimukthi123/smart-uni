import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  MdDashboard, MdMeetingRoom, MdEvent, MdCalendarMonth,
  MdBarChart, MdNotifications, MdPeople, MdLogout,
  MdChevronLeft, MdChevronRight, MdSchool, MdChat, MdPerson, MdAnalytics, MdHistory
} from 'react-icons/md';

const adminNav = [
  { section: 'Main Control', items: [
    { label: 'Admin Dashboard', to: '/admin', icon: <MdDashboard />, end: true },
    { label: 'Manage Rooms', to: '/admin/rooms', icon: <MdMeetingRoom /> },
    { label: 'Event Requests', to: '/admin/events', icon: <MdEvent /> },
    { label: 'Schedule Matrix', to: '/admin/schedules', icon: <MdCalendarMonth /> },
    { label: 'User Analytics', to: '/admin/analytics', icon: <MdAnalytics /> },
    { label: 'User Mgt', to: '/admin/users', icon: <MdPeople /> },
  ]},
  { section: 'Rental Admin', items: [
    { label: 'Rental Home', to: '/rental', icon: <MdDashboard /> },
    { label: 'Items', to: '/rental/items', icon: <MdDashboard /> },
    { label: 'Suppliers', to: '/rental/suppliers', icon: <MdPeople /> },
  ]},
  { section: 'Learning Admin', items: [
    { label: 'Dashboard', to: '/learning', icon: <MdSchool /> },
    { label: 'Resources', to: '/learning/resources', icon: <MdSchool /> },
    { label: 'Task Board', to: '/learning/tasks', icon: <MdSchool /> },
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
  { section: 'My Portal', items: [
    { label: 'My Dashboard', to: '/dashboard', icon: <MdDashboard />, end: true },
    { label: 'Room Requests', to: '/dashboard/requests', icon: <MdEvent /> },
    { label: 'My Schedule', to: '/dashboard/schedule', icon: <MdCalendarMonth /> },
  ]},
  { section: 'Rental Store', items: [
    { label: 'Browse Rentals', to: '/rental', icon: <MdDashboard /> },
    { label: 'My Cart', to: '/rental/cart', icon: <MdDashboard /> },
    { label: 'Kit Generator', to: '/rental/kit-generator', icon: <MdDashboard /> },
    { label: 'Order History', to: '/rental/history', icon: <MdHistory /> },
  ]},
  { section: 'Learning Hub', items: [
    { label: 'Learning Dash', to: '/learning', icon: <MdSchool /> },
    { label: 'Find Peers', to: '/learning/peers', icon: <MdPeople /> },
    { label: 'Tasks', to: '/learning/tasks', icon: <MdSchool /> },
    { label: 'Resources', to: '/learning/resources', icon: <MdSchool /> },
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
    { label: 'My Dashboard', to: '/supplier', icon: <MdDashboard />, end: true },
    { label: 'My Products', to: '/supplier/products', icon: <MdDashboard /> },
    { label: 'Orders received', to: '/supplier/orders', icon: <MdEvent /> },
  ]}
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout, isAdmin, isSupplier, isAdminOrScheduler } = useAuth();
  
  let navSections = studentNav;
  if (isAdminOrScheduler) navSections = adminNav;
  if (isSupplier) navSections = supplierNav;

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">SC</div>
        {!collapsed && (
          <div className="sidebar-brand">
            SmartCampus
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
