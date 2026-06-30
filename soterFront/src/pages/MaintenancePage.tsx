import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function MaintenancePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mantenimientos</h1>
        <p className="text-muted-foreground">
          Gestión de mantenimientos de equipos y sistemas
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximamente</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            El módulo de mantenimientos está en desarrollo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
