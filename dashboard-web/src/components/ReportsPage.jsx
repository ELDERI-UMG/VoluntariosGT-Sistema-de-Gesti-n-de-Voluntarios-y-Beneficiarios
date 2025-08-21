import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const ReportsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Reporte de Actividades</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Estadísticas detalladas de actividades por período
            </p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Generar Reporte
            </button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Reporte de Voluntarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Análisis de participación y rendimiento
            </p>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Generar Reporte
            </button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Mapa de Calor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Visualización geográfica de actividades
            </p>
            <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700">
              Ver Mapa
            </button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Exportar Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Descarga reportes en formato CSV
            </p>
            <button className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
              Exportar CSV
            </button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gráficos de Tendencias</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Próximamente: Gráficos interactivos con datos en tiempo real
          </div>
        </CardContent>
      </Card>
    </div>
  );
};