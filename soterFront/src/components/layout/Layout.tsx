import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/slices/authSlice';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { rolePermissions } from '@/lib/permissions';
import {
  LayoutDashboard,
  AlertTriangle,
  Building2,
  Shield,
  Truck,
  Settings,
  LogOut,
  Menu,
  X,
  MessageSquare,
  FileSearch,
  Wrench,
  Package,
  Brain,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: string;
}

const allNavigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, permission: 'dashboard' },
  { name: 'Minuta', href: '/minuta', icon: MessageSquare, permission: 'minuta' },
  { name: 'Incidentes', href: '/incidents', icon: AlertTriangle, permission: 'incidents' },
  { name: 'Instalaciones', href: '/installations', icon: Building2, permission: 'installations' },
  { name: 'Inventario Equipos', href: '/electronic-inventory', icon: Package, permission: 'security_electronic' },
  { name: 'Seguridad Física', href: '/physical-security', icon: Shield, permission: 'security_physical' },
  { name: 'Estudios de Seguridad', href: '/studies', icon: FileSearch, permission: 'studies' },
  { name: 'Mantenimientos', href: '/maintenance', icon: Wrench, permission: 'maintenance' },
  { name: 'Inventario', href: '/inventory', icon: Package, permission: 'inventory' },
  { name: 'Escoltas', href: '/escorts', icon: Truck, permission: 'escorts' },
  { name: 'Inteligencia Artificial', href: '/ai', icon: Brain, permission: 'ai' },
  { name: 'Administración', href: '/admin', icon: Settings, permission: 'admin' },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <aside
          className={cn(
            'fixed left-0 top-0 z-50 h-screen w-64 bg-white border-r transition-transform lg:translate-x-0',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between h-16 px-4 border-b">
              <Link to="/" className="flex items-center gap-2">
                <Shield className="h-8 w-8 text-primary" />
                <span className="text-xl font-bold">SOTER</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
              {allNavigation
                .filter(item => rolePermissions[user?.role as keyof typeof rolePermissions]?.includes(item.permission as any))
                .map((item) => {
                  const isActive = location.pathname === item.href ||
                    (item.href !== '/' && location.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-gray-100'
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
            </nav>

            <div className="p-4 border-t">
              <div className="mb-4">
                <p className="text-sm font-medium">{user?.name} {user?.lastName}</p>
                <p className="text-xs text-muted-foreground">{user?.role}</p>
              </div>
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </aside>

        <div className="flex-1 lg:ml-64">
          <header className="sticky top-0 z-40 h-16 bg-white border-b">
            <div className="flex items-center justify-between h-full px-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-4">
                {user?.installation && (
                  <span className="text-sm text-muted-foreground">
                    {user.installation.name}
                  </span>
                )}
              </div>
            </div>
          </header>

          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}