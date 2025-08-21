import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const UsersPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1,247</div>
            <p className="text-sm text-gray-600">Registrados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Voluntarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">892</div>
            <p className="text-sm text-gray-600">Activos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Beneficiarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">298</div>
            <p className="text-sm text-gray-600">Registrados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Entidades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">57</div>
            <p className="text-sm text-gray-600">Verificadas</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Próximamente: Gestión completa de usuarios
          </div>
        </CardContent>
      </Card>
    </div>
  );
};