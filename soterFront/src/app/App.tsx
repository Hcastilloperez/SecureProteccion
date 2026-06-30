import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/DashboardPage';
import IncidentsPage from '@/pages/IncidentsPage';
import IncidentDetailPage from '@/pages/IncidentDetailPage';
import MinutaPage from '@/pages/MinutaPage';
import InstallationsPage from '@/pages/InstallationsPage';
import InstallationDetailPage from '@/pages/InstallationDetailPage';
import ElectronicSecurityPage from '@/pages/ElectronicSecurityPage';
import InventoryPage from '@/pages/InventoryPage';
import PhysicalSecurityPage from '@/pages/PhysicalSecurityPage';
import EscortsPage from '@/pages/EscortsPage';
import AdminPage from '@/pages/AdminPage';
import AIPage from '@/pages/AIPage';
import MaintenancePage from '@/pages/MaintenancePage';
import Layout from '@/components/layout/Layout';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function PermissionRoute({ permission, children }: { permission: string; children: React.ReactNode }) {
  const { user } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userPermissions = user.permissions || {};
  const hasAccess = userPermissions.all === true || userPermissions[permission] === true;

  if (!hasAccess) {
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
            <PermissionRoute permission="electronic_security">
              <ElectronicSecurityPage />
            </PermissionRoute>
          }
        />
        <Route
          path="inventory"
          element={
            <PermissionRoute permission="inventory">
              <InventoryPage />
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
        <Route
          path="maintenance"
          element={
            <PermissionRoute permission="maintenance">
              <MaintenancePage />
            </PermissionRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;