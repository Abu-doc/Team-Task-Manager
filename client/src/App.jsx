import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CommandProvider } from './context/CommandContext';

// Import your existing layout framework and login pages
import AuthPage from './features/auth/AuthPage';
import DashboardLayout from './layout/DashboardLayout';
import Dashboard from './features/dashboard/Dashboard';

// 📁 Feature Pages
import AdminManagement from './pages/AdminManagement';
import MemberProjects from './pages/MemberProjects'; // 💡 New component for your team members

// 🛡️ SECURITY GUARD WITH ROLE CHECKS
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  
  if (loading) return null; 
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
    <Routes>
      {/* Public Auth Gate */}
      <Route 
        path="/login" 
        element={user ? <Navigate to="/" replace /> : <AuthPage />} 
      />
      
      {/* 🌐 MAIN WORKSPACE LAYOUT WITH DOCK IMPLEMENTATION */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* 🏠 1st Dock Button (Home): Loads your beautiful Kanban Swimlane Board */}
        <Route index element={<Dashboard />} />

        {/* 📁 2nd Dock Button (Folder): Dynamically switches between Admin Matrix and Member Projects view */}
        <Route 
          path="projects" 
          element={
            user?.role === 'ADMIN' ? (
              <AdminManagement />
            ) : (
              <MemberProjects />
            )
          } 
        />
      </Route>

      {/* Catch-all safety fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <CommandProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CommandProvider>
    </AuthProvider>
  );
}

export default App;