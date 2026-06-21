import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { rolePermissions, Permission } from '@/lib/permissions';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import IncidentsPage from '@/pages/IncidentsPage';
import IncidentDetailPage from '@/pages/IncidentDetailPage';
import MinutaPage from '@/pages/MinutaPage';
import InstallationsPage from '@/pages/InstallationsPage';
import InstallationDetailPage from '@/pages/InstallationDetailPage';
import ElectronicSecurityPage from '@/pages/ElectronicSecurityPage';
import ElectronicInventoryPage from '@/pages/ElectronicInventoryPage';
import PhysicalSecurityPage from '@/pages/PhysicalSecurityPage';
import EscortsPage from '@/pages/EscortsPage';
import AdminPage from '@/pages/AdminPage';
import AIPage from '@/pages/AIPage';
import Layout from '@/components/layout/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function PermissionRoute({ permission, children }: { permission: Permission; children: React.ReactNode }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const userRole = user?.role as keyof typeof rolePermissions;
  
  if (!user || !rolePermissions[userRole]?.includes(permission)) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="incidents"
          element={
            <PermissionRoute permission="incidents">
              <IncidentsPage />
            </PermissionRoute>
          }
        />
        <Route
          path="incidents/:id"
          element={
            <PermissionRoute permission="incidents">
              <IncidentDetailPage />
            </PermissionRoute>
          }
        />
        <Route
          path="minuta"
          element={
            <PermissionRoute permission="minuta">
              <MinutaPage />
            </PermissionRoute>
          }
        />
        <Route
          path="installations"
          element={
            <PermissionRoute permission="installations">
              <InstallationsPage />
            </PermissionRoute>
          }
        />
        <Route
          path="installations/:id"
          element={
            <PermissionRoute permission="installations">
              <InstallationDetailPage />
            </PermissionRoute>
          }
        />
        <Route
          path="electronic-security"
          element={
            <PermissionRoute permission="security_electronic">
              <ElectronicSecurityPage />
            </PermissionRoute>
          }
        />
        <Route
          path="electronic-inventory"
          element={
            <PermissionRoute permission="security_electronic">
              <ElectronicInventoryPage />
            </PermissionRoute>
          }
        />
        <Route
          path="physical-security"
          element={
            <PermissionRoute permission="security_physical">
              <PhysicalSecurityPage />
            </PermissionRoute>
          }
        />
        <Route
          path="escorts"
          element={
            <PermissionRoute permission="escorts">
              <EscortsPage />
            </PermissionRoute>
          }
        />
        <Route
          path="admin/*"
          element={
            <PermissionRoute permission="admin">
              <AdminPage />
            </PermissionRoute>
          }
        />
        <Route
          path="ai"
          element={
            <PermissionRoute permission="ai">
              <AIPage />
            </PermissionRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;