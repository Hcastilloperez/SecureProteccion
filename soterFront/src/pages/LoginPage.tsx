import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authService } from '@/services/auth.service';
import { setCredentials } from '@/redux/slices/authSlice';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
});

type LoginFormData = z.infer<typeof loginSchema>;

const TEST_USERS = [
  { email: 'admin@soter.com', password: 'admin123', role: 'ADMIN', label: 'Administrador' },
  { email: 'operador@soter.com', password: 'operador123', role: 'OPERADOR_CENTRO', label: 'Operador Centro' },
  { email: 'coord.fisica@soter.com', password: 'coorfisica123', role: 'COORDINADOR_FISICA', label: 'Coord. Seguridad Física' },
  { email: 'coord.electronica@soter.com', password: 'coorelectronica123', role: 'COORDINADOR_ELECTRONICA', label: 'Coord. Seguridad Electrónica' },
  { email: 'coord.investigaciones@soter.com', password: 'coorinvest123', role: 'COORDINADOR_INVESTIGACIONES', label: 'Coord. Investigaciones' },
  { email: 'coord.administrativo@soter.com', password: 'cooradmin123', role: 'COORDINADOR_ADMINISTRATIVO', label: 'Coord. Administrativo' },
  { email: 'coord.locativas@soter.com', password: 'coorlocal123', role: 'COORDINADOR_ACCIONES_LOCALITATIVAS', label: 'Coord. Acciones Locativas' },
  { email: 'gerente@soter.com', password: 'gerente123', role: 'GERENTE_SEGURIDAD', label: 'Gerente de Seguridad' },
  { email: 'escolta@soter.com', password: 'escolta123', role: 'ESCOLTA', label: 'Escolta' },
  { email: 'vigilante@soter.com', password: 'vigilante123', role: 'VIGILANTE', label: 'Vigilante' },
];

export default function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = useCallback(async (data: LoginFormData) => {
    try {
      const response = await authService.login(data);
      if (response.success && response.data) {
        dispatch(setCredentials(response.data));
        navigate('/');
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al iniciar sesión');
    }
  }, [dispatch, navigate]);

  const selectUser = useCallback((user: typeof TEST_USERS[0]) => {
    setValue('email', user.email);
    setValue('password', user.password);
  }, [setValue]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">SOTER</CardTitle>
          <CardDescription className="text-center">
            Sistema de Gestión de Seguridad
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="correo@ejemplo.com"
                {...register('email')}
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                {...register('password')}
              />
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </Button>
          </form>

          <div className="mt-6">
            <p className="text-sm font-semibold text-muted-foreground mb-2">Usuarios de prueba (clic rápido):</p>
            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
              {TEST_USERS.map((user) => (
                <button
                  key={user.email}
                  type="button"
                  onClick={() => selectUser(user)}
                  className="p-2 text-left rounded-md border text-xs transition-colors hover:bg-accent bg-card"
                >
                  <p className="font-medium truncate">{user.label}</p>
                  <p className="text-muted-foreground truncate">{user.role}</p>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
