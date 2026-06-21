import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { adminService } from '@/services/admin.service';
import { DashboardStats } from '@/types';
import { getStatusText } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, Building2, Shield, Users, Truck, Activity,
  Monitor, Wrench, Package, Clock, CheckCircle, XCircle,
  ArrowUp, ArrowDown, AlertCircle, TrendingUp
} from 'lucide-react';
import api from '@/config/axios';

interface WidgetProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  color: string;
}

function StatCard({ title, value, subtitle, icon, trend, color }: WidgetProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {trend && (
          <div className={`flex items-center gap-1 mt-1 text-xs ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            <span>{trend.value}% vs semana anterior</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useSelector((state: RootState) => state.auth);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [escortMovements, setEscortMovements] = useState<any[]>([]);
  const [maintenanceStats, setMaintenanceStats] = useState<any>(null);
  const [inventoryStats, setInventoryStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const statsRes = await adminService.getDashboardStats();
        if (statsRes.success && statsRes.data) {
          setStats(statsRes.data);
        }

        if (user?.role === 'ADMIN' || user?.role === 'GERENTE_SEGURIDAD' || user?.role === 'COORDINADOR_ELECTRONICA') {
          const [movementsRes, maintenanceRes, inventoryRes] = await Promise.all([
            api.get('/escorts/movements/today'),
            api.get('/admin/maintenance/stats'),
            api.get('/inventory/stats'),
          ]);
          if (movementsRes.data.success) setEscortMovements(movementsRes.data.data);
          if (maintenanceRes.data.success) setMaintenanceStats(maintenanceRes.data);
          if (inventoryRes.data.success) setInventoryStats(inventoryRes.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user?.role]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const role = user?.role || 'VIGILANTE';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Bienvenido, {user?.name} {user?.lastName}
        </h1>
        <p className="text-muted-foreground">
          Dashboard - {getStatusText(role)}
        </p>
      </div>

      {(role === 'ADMIN' || role === 'GERENTE_SEGURIDAD' || role === 'OPERADOR_CENTRO' || role === 'COORDINADOR_INVESTIGACIONES') && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Incidentes Abiertos"
            value={stats?.openIncidents || 0}
            subtitle={`de ${stats?.totalIncidents || 0} totales`}
            icon={<AlertTriangle className="h-4 w-4 text-orange-600" />}
            color="bg-orange-100"
          />
          <StatCard
            title="Instalaciones"
            value={stats?.installationsCount || 0}
            subtitle="registradas"
            icon={<Building2 className="h-4 w-4 text-blue-600" />}
            color="bg-blue-100"
          />
          <StatCard
            title="Casos Cerrados"
            value={(stats?.totalIncidents || 0) - (stats?.openIncidents || 0)}
            subtitle="histórico total"
            icon={<CheckCircle className="h-4 w-4 text-green-600" />}
            color="bg-green-100"
          />
          <StatCard
            title="Tasa de Cierre"
            value={stats?.totalIncidents ? Math.round(((stats.totalIncidents - stats.openIncidents) / stats.totalIncidents) * 100) : 0}
            subtitle="%"
            icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
            color="bg-purple-100"
          />
        </div>
      )}

      {(role === 'ADMIN' || role === 'GERENTE_SEGURIDAD' || role === 'COORDINADOR_FISICA') && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Vigilantes Activos"
            value={stats?.securityGuardsCount || 0}
            subtitle="en servicio"
            icon={<Shield className="h-4 w-4 text-green-600" />}
            color="bg-green-100"
          />
          <StatCard
            title="Escoltas en Operación"
            value={stats?.escortsCount || 0}
            subtitle="activos"
            icon={<Users className="h-4 w-4 text-purple-600" />}
            color="bg-purple-100"
          />
          <StatCard
            title="Sistemas Activos"
            value={stats?.activeSystems || 0}
            subtitle="instalados"
            icon={<Monitor className="h-4 w-4 text-cyan-600" />}
            color="bg-cyan-100"
          />
          <StatCard
            title="Equipos"
            value={inventoryStats?.totalEquipments || 0}
            subtitle={`${inventoryStats?.activeEquipments || 0} activos`}
            icon={<Package className="h-4 w-4 text-amber-600" />}
            color="bg-amber-100"
          />
        </div>
      )}

      {(role === 'ADMIN' || role === 'GERENTE_SEGURIDAD' || role === 'COORDINADOR_ELECTRONICA') && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Equipos Activos"
            value={inventoryStats?.activeEquipments || 0}
            subtitle="operativos"
            icon={<Monitor className="h-4 w-4 text-green-600" />}
            color="bg-green-100"
          />
          <StatCard
            title="En Reparación"
            value={inventoryStats?.inRepairEquipments || 0}
            subtitle="equipos"
            icon={<Wrench className="h-4 w-4 text-orange-600" />}
            color="bg-orange-100"
          />
          <StatCard
            title="Mantenimientos"
            value={maintenanceStats?.scheduledCount || 0}
            subtitle="programados"
            icon={<Clock className="h-4 w-4 text-blue-600" />}
            color="bg-blue-100"
          />
          <StatCard
            title="Completados"
            value={maintenanceStats?.completedCount || 0}
            subtitle="este mes"
            icon={<CheckCircle className="h-4 w-4 text-green-600" />}
            color="bg-green-100"
          />
        </div>
      )}

      {role === 'ESCOLTA' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Movimientos Hoy"
            value={escortMovements.length}
            subtitle="asignados"
            icon={<Truck className="h-4 w-4 text-blue-600" />}
            color="bg-blue-100"
          />
          <StatCard
            title="En Progreso"
            value={escortMovements.filter(m => m.status === 'IN_PROGRESS').length}
            subtitle="movimientos"
            icon={<Activity className="h-4 w-4 text-green-600" />}
            color="bg-green-100"
          />
          <StatCard
            title="Programados"
            value={escortMovements.filter(m => m.status === 'SCHEDULED').length}
            subtitle="para hoy"
            icon={<Clock className="h-4 w-4 text-amber-600" />}
            color="bg-amber-100"
          />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {(role === 'ADMIN' || role === 'GERENTE_SEGURIDAD' || role === 'OPERADOR_CENTRO' || role === 'COORDINADOR_INVESTIGACIONES') && (
          <Card>
            <CardHeader>
              <CardTitle>Incidentes por Prioridad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats?.incidentsByPriority && Object.entries(stats.incidentsByPriority).map(([priority, count]) => {
                  const percentage = stats.totalIncidents ? Math.round((count / stats.totalIncidents) * 100) : 0;
                  const colorClass = priority === 'CRITICAL' ? 'bg-red-600' : priority === 'HIGH' ? 'bg-orange-600' : priority === 'MEDIUM' ? 'bg-yellow-600' : 'bg-green-600';
                  return (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                          {getStatusText(priority)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 flex-1 ml-4">
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full ${colorClass}`} style={{ width: `${percentage}%` }} />
                        </div>
                        <span className="text-sm font-bold w-8">{count}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-between text-sm text-muted-foreground">
                <span>Total: {stats?.totalIncidents || 0}</span>
                <span>Abiertos: {stats?.openIncidents || 0}</span>
                <span>Cerrados: {(stats?.totalIncidents || 0) - (stats?.openIncidents || 0)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Incidentes Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {stats?.recentIncidents && stats.recentIncidents.length > 0 ? (
                stats.recentIncidents.slice(0, 5).map((incident) => (
                  <Link
                    key={incident.id}
                    to={`/incidents/${incident.id}`}
                    className="block p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{incident.title}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {incident.incidentType.name} • {incident.installation.name}
                        </p>
                      </div>
                      <Badge className={incident.priority === 'CRITICAL' ? 'bg-red-100 text-red-700' : incident.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : incident.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                        {getStatusText(incident.priority)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{getStatusText(incident.status.code)}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(incident.createdAt).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay incidentes recientes
                </p>
              )}
            </div>
            <div className="mt-4">
              <Link to="/incidents">
                <Button variant="outline" className="w-full">
                  Ver todos los incidentes
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {(role === 'ADMIN' || role === 'GERENTE_SEGURIDAD' || role === 'COORDINADOR_ELECTRONICA') && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Estado de Equipos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Activos</span>
                  </div>
                  <span className="font-bold">{inventoryStats?.activeEquipments || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-yellow-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Wrench className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">En Reparación</span>
                  </div>
                  <span className="font-bold">{inventoryStats?.inRepairEquipments || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Package className="h-4 w-4 text-gray-600" />
                    <span className="text-sm">Inactivos</span>
                  </div>
                  <span className="font-bold">{inventoryStats?.inactiveEquipments || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Dados de Baja</span>
                  </div>
                  <span className="font-bold">{inventoryStats?.decommissionedEquipments || 0}</span>
                </div>
              </div>
              <div className="mt-4">
                <Link to="/electronic-inventory">
                  <Button variant="outline" className="w-full">
                    Ver Inventario
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mantenimientos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {maintenanceStats?.recent?.length > 0 ? (
                  maintenanceStats.recent.slice(0, 5).map((m: any) => (
                    <div key={m.id} className="flex items-center justify-between p-2 border rounded-lg">
                      <div>
                        <p className="text-sm font-medium">{m.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {m.equipment?.name || 'Sin equipo'} • {new Date(m.scheduledDate).toLocaleDateString('es-CO')}
                        </p>
                      </div>
                      <Badge className={m.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : m.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}>
                        {getStatusText(m.status)}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay mantenimientos recientes
                  </p>
                )}
              </div>
              <div className="mt-4">
                <Link to="/electronic-security">
                  <Button variant="outline" className="w-full">
                    Ver Mantenimientos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {(role === 'ADMIN' || role === 'GERENTE_SEGURIDAD' || role === 'COORDINADOR_FISICA') && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Seguridad Física</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm">Vigilantes Activos</span>
                  </div>
                  <span className="font-bold">{stats?.securityGuardsCount || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Escoltas Activos</span>
                  </div>
                  <span className="font-bold">{stats?.escortsCount || 0}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link to="/physical-security" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Seguridad Física
                  </Button>
                </Link>
                <Link to="/escorts" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Escoltas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertas de Seguridad</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-48 overflow-y-auto">
                {stats?.recentIncidents?.filter(i => i.priority === 'CRITICAL' || i.priority === 'HIGH').length ? (
                  stats.recentIncidents
                    .filter(i => i.priority === 'CRITICAL' || i.priority === 'HIGH')
                    .slice(0, 4)
                    .map((incident) => (
                      <div key={incident.id} className="flex items-start gap-2 p-2 border-l-4 border-red-500 bg-red-50 rounded-r-lg">
                        <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">{incident.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {incident.installation.name} • {getStatusText(incident.priority)}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay alertas críticas
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {role === 'ESCOLTA' && (
        <Card>
          <CardHeader>
            <CardTitle>Movimientos de Hoy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {escortMovements.length > 0 ? (
                escortMovements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${movement.status === 'COMPLETED' ? 'bg-green-100' : movement.status === 'IN_PROGRESS' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                        <Truck className={`h-4 w-4 ${movement.status === 'COMPLETED' ? 'text-green-600' : movement.status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <p className="font-medium">{movement.route?.name || 'Sin ruta'}</p>
                        <p className="text-sm text-muted-foreground">
                          {movement.escort?.name} {movement.escort?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(movement.date).toLocaleDateString('es-CO')} • {new Date(movement.startTime).toLocaleTimeString('es-CO')}
                        </p>
                      </div>
                    </div>
                    <Badge className={movement.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : movement.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' : movement.status === 'SCHEDULED' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}>
                      {getStatusText(movement.status)}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay movimientos programados para hoy
                </p>
              )}
            </div>
            <div className="mt-4">
              <Link to="/escorts">
                <Button variant="outline" className="w-full">
                  Ver todos los movimientos
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
