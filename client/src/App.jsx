import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth, AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext'; // Rental

// Layout
import Layout from './components/layout/Layout';

// Auth Pages (Unified)
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SupplierRegisterPage from './pages/auth/SupplierRegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import RoomsPage from './pages/admin/RoomsPage';
import EventsPage from './pages/admin/EventsPage';
import SchedulePage from './pages/admin/SchedulePage';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import UsersPage from './pages/admin/UsersPage';

// User / Shared Pages
import UserDashboard from './pages/user/UserDashboard';
import UserRequestsPage from './pages/user/UserRequestsPage';
import UserSchedulePage from './pages/user/UserSchedulePage';
import UserProfilePage from './pages/user/UserProfilePage';
import MessagesPage from './pages/messages/MessagesPage';

// Smart Rental System Pages
import RentalLandingPage from './pages/rental/rentalLandingPage';
import ItemList from './pages/rental/rentItem/itemList';
import ItemDetails from './pages/rental/rentItem/itemDetails';
import SupplierList from './pages/rental/supplierList';
import SupplierDetails from './pages/rental/supplierDetails';
import KitGenerator from './pages/rental/kitGenerator';
import KitGeneratorInput from './pages/rental/kitGeneratorInput';
import CartPage from './pages/rental/rentItem/cart';
import CheckoutPage from './pages/rental/rentItem/checkout';
import HistoryPage from './pages/rental/history';
import WriteReview from './pages/rental/addReview';
import SupplierPage from './pages/rental/supplierPage';

// SmartLearningHub Pages
import LearningDashboard from './pages/learning/SmartLearning/Dashboard';
import FindPeers from './pages/learning/Peers/FindPeers';
import AcademicTask from './pages/learning/Task/AcademicTask';
import MyActivity from './pages/learning/Activity/MyActivity';
import ResourceHub from './pages/learning/Resources/ResourceHub';

// Momentum Pages
import MomentumDashboard from './pages/momentum/MomentumDashboard/MoDash';
import StudyTracker from './pages/momentum/study tracker/studyTracker';
import GenerateWorkplan from './pages/momentum/workplanGenerate/planGenerate';
import Planner from './pages/momentum/myPlans/myPlans';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-shell" style={{ justifyContent: 'center', alignItems: 'center' }}><span className="spinner lg indigo" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  return children;
};

function AppContent() {
  const { user } = useAuth();
  return (
    <>
      <Toaster position="top-right" toastOptions={{ 
        className: 'glass-card-static',
        style: { background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }
      }} />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register-supplier" element={<SupplierRegisterPage />} />

        <Route path="/" element={<Layout />}>
          {/* Admin / Scheduler Routes */}
          <Route path="admin" element={<ProtectedRoute allowedRoles={['admin', 'scheduler']}><AdminDashboard /></ProtectedRoute>} />
          <Route path="admin/rooms" element={<ProtectedRoute allowedRoles={['admin', 'scheduler']}><RoomsPage /></ProtectedRoute>} />
          <Route path="admin/events" element={<ProtectedRoute allowedRoles={['admin', 'scheduler']}><EventsPage /></ProtectedRoute>} />
          <Route path="admin/schedules" element={<ProtectedRoute allowedRoles={['admin', 'scheduler']}><SchedulePage /></ProtectedRoute>} />
          <Route path="admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AnalyticsPage /></ProtectedRoute>} />
          <Route path="admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UsersPage /></ProtectedRoute>} />

          {/* User Routes (Core) */}
          <Route path="dashboard" element={<ProtectedRoute allowedRoles={['student', 'user', 'scheduler', 'admin']}><UserDashboard /></ProtectedRoute>} />
          <Route path="dashboard/requests" element={<ProtectedRoute allowedRoles={['student', 'user', 'scheduler', 'admin']}><UserRequestsPage /></ProtectedRoute>} />
          <Route path="dashboard/schedule" element={<ProtectedRoute allowedRoles={['student', 'user', 'scheduler', 'admin']}><UserSchedulePage /></ProtectedRoute>} />
          
          <Route path="messages" element={<ProtectedRoute allowedRoles={['student', 'user', 'scheduler', 'admin', 'supplier']}><MessagesPage /></ProtectedRoute>} />
          <Route path="profile" element={<ProtectedRoute allowedRoles={['student', 'user', 'scheduler', 'admin', 'supplier']}><UserProfilePage /></ProtectedRoute>} />
          
          {/* Smart Rental System Routes */}
          <Route path="rental" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin', 'supplier']}><RentalLandingPage /></ProtectedRoute>} />
          <Route path="rental/items" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin', 'supplier']}><ItemList /></ProtectedRoute>} />
          <Route path="rental/items/:id" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin', 'supplier']}><ItemDetails /></ProtectedRoute>} />
          <Route path="rental/suppliers" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin', 'supplier']}><SupplierList /></ProtectedRoute>} />
          <Route path="rental/supplier-details" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin', 'supplier']}><SupplierDetails /></ProtectedRoute>} />
          <Route path="rental/kit-generator" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin', 'supplier']}><KitGenerator /></ProtectedRoute>} />
          <Route path="rental/kit-generator/input" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin', 'supplier']}><KitGeneratorInput /></ProtectedRoute>} />
          <Route path="rental/cart" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin', 'supplier']}><CartPage /></ProtectedRoute>} />
          <Route path="rental/checkout" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin', 'supplier']}><CheckoutPage /></ProtectedRoute>} />
          <Route path="rental/history" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin', 'supplier']}><HistoryPage /></ProtectedRoute>} />
          <Route path="rental/review" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin', 'supplier']}><WriteReview /></ProtectedRoute>} />
          <Route path="supplier/*" element={<ProtectedRoute allowedRoles={['supplier', 'admin']}><SupplierPage /></ProtectedRoute>} />

          {/* SmartLearningHub Routes */}
          <Route path="learning" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin']}><LearningDashboard /></ProtectedRoute>} />
          <Route path="learning/peers" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin']}><FindPeers /></ProtectedRoute>} />
          <Route path="learning/tasks" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin']}><AcademicTask /></ProtectedRoute>} />
          <Route path="learning/activity" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin']}><MyActivity /></ProtectedRoute>} />
          <Route path="learning/resources" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin']}><ResourceHub /></ProtectedRoute>} />

          {/* Momentum Routes */}
          <Route path="momentum" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin']}><MomentumDashboard /></ProtectedRoute>} />
          <Route path="momentum/tracker" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin']}><StudyTracker /></ProtectedRoute>} />
          <Route path="momentum/workplan" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin']}><GenerateWorkplan /></ProtectedRoute>} />
          <Route path="momentum/vault" element={<ProtectedRoute allowedRoles={['student', 'user', 'admin']}><Planner /></ProtectedRoute>} />
          
          <Route path="*" element={<Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />} />
        </Route>
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <SocketProvider>
              <AppContent />
            </SocketProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;

