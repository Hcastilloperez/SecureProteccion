import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { logout } from '@/redux/slices/authSlice';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  Package,
  Brain,
  Wrench,
  MonitorPlay,
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
  { name: 'Seguridad Electrónica', href: '/electronic-security', icon: MonitorPlay, permission: 'electronic_security' },
  { name: 'Inventario Equipos', href: '/inventory', icon: Package, permission: 'inventory' },
  { name: 'Seguridad Física', href: '/physical-security', icon: Shield, permission: 'security_physical' },
  { name: 'Mantenimientos', href: '/maintenance', icon: Wrench, permission: 'maintenance' },
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

  const hasPermission = (permission: string): boolean => {
    if (!user?.permissions) return false;
    if (user.permissions.all === true) return true;
    return user.permissions[permission] === true;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      >
        Saltar al contenido principal
      </a>
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
                <Shield className="h-8 w-8 text-primary" aria-hidden="true" />
                <span className="text-xl font-bold">SOTER</span>
              </Link>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-label="Cerrar menú de navegación"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
              {allNavigation
                .filter(item => hasPermission(item.permission))
                .map((item) => {
                  const isActive = location.pathname === item.href ||
                    (item.href !== '/' && location.pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-gray-100'
                      )}
                    >
                      <item.icon className="h-5 w-5" aria-hidden="true" />
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
                aria-label="Abrir menú de navegación"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
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

          <main id="main-content" className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}