import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const ActivitiesPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Gestión de Actividades</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actividades Activas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">12</div>
            <p className="text-sm text-gray-600">En progreso</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Nuevas Inscripciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">48</div>
            <p className="text-sm text-gray-600">Esta semana</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Actividades Completadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">156</div>
            <p className="text-sm text-gray-600">Este mes</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Actividades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Próximamente: Lista completa de actividades
          </div>
        </CardContent>
      </Card>
    </div>
  );
};