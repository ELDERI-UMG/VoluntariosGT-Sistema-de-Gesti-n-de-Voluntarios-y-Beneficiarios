import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { DataService } from '../lib/dataService.js';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download, TrendingUp, Users, Calendar, FileText } from 'lucide-react';

const COLORS = ['#14b8a6', '#0d9488', '#2dd4bf', '#5eead4', '#99f6e4'];

export const ReportsPage = () => {
  const [reportData, setReportData] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActions, setLoadingActions] = useState({});

  // Cargar datos iniciales
  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      const [activities, charts] = await Promise.all([
        DataService.getActivityReport(),
        DataService.getChartData('actividades')
      ]);
      
      setReportData(activities);
      setChartData(charts);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  // Manejar generación de reportes
  const handleGenerateReport = async (type) => {
    setLoadingActions({ ...loadingActions, [type]: true });
    
    try {
      await DataService.getActivityReport({ tipo: type });
      alert(`✅ Reporte de ${type} generado exitosamente`);
    } catch (error) {
      alert(`❌ Error generando reporte: ${error.message}`);
    }
    
    setLoadingActions({ ...loadingActions, [type]: false });
  };

  // Manejar descarga CSV
  const handleDownloadCSV = async (type = 'actividades') => {
    setLoadingActions({ ...loadingActions, csv: true });
    
    try {
      const result = await DataService.downloadCSVReport(type);
      if (result.success) {
        alert('✅ ' + result.message);
      }
    } catch (error) {
      alert(`❌ Error descargando: ${error.message}`);
    }
    
    setLoadingActions({ ...loadingActions, csv: false });
  };

  // Preparar datos para gráfico de pastel
  const pieData = reportData ? Object.entries(reportData.actividades_por_categoria || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value
  })) : [];

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Reportes y Estadísticas</h1>
        <div className="flex items-center justify-center py-12">
          <div className="turquoise-loading w-12 h-12"></div>
          <span className="ml-3 text-gray-600">Cargando datos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-turquoise-700">Reportes y Estadísticas</h1>
        <Button onClick={loadReportData} className="btn-turquoise-outline">
          🔄 Actualizar Datos
        </Button>
      </div>

      {/* Estadísticas principales */}
      {reportData && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="stats-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-turquoise-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Actividades</p>
                  <p className="text-2xl font-bold text-turquoise-600">{reportData.total_actividades}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="stats-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-turquoise-500" />
                <div>
                  <p className="text-sm text-gray-600">Crecimiento</p>
                  <p className="text-2xl font-bold text-turquoise-500">{reportData.tendencias?.crecimiento || '+15%'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="stats-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-turquoise-400" />
                <div>
                  <p className="text-sm text-gray-600">En Progreso</p>
                  <p className="text-2xl font-bold text-turquoise-400">{reportData.actividades_por_estado?.en_progreso || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="stats-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm text-gray-600">Completadas</p>
                  <p className="text-2xl font-bold text-amber-500">{reportData.actividades_por_estado?.completada || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Acciones de reportes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="turquoise-card">
          <CardHeader>
            <CardTitle className="text-turquoise-700">Reporte de Actividades</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Estadísticas detalladas de actividades por período
            </p>
            <Button 
              onClick={() => handleGenerateReport('actividades')}
              disabled={loadingActions.actividades}
              className="w-full btn-turquoise"
            >
              {loadingActions.actividades ? '⏳ Generando...' : '📊 Generar Reporte'}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="turquoise-card">
          <CardHeader>
            <CardTitle className="text-turquoise-700">Reporte de Voluntarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Análisis de participación y rendimiento
            </p>
            <Button 
              onClick={() => handleGenerateReport('voluntarios')}
              disabled={loadingActions.voluntarios}
              className="w-full btn-turquoise-outline"
            >
              {loadingActions.voluntarios ? '⏳ Generando...' : '👥 Generar Reporte'}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="turquoise-card">
          <CardHeader>
            <CardTitle className="text-turquoise-700">Exportar Datos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Descarga reportes en formato CSV
            </p>
            <Button 
              onClick={() => handleDownloadCSV('actividades')}
              disabled={loadingActions.csv}
              className="w-full btn-turquoise-outline"
            >
              <Download className="mr-2 h-4 w-4" />
              {loadingActions.csv ? '⏳ Descargando...' : 'Exportar CSV'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de barras - Tendencias mensuales */}
        <Card className="turquoise-chart">
          <CardHeader>
            <CardTitle className="text-turquoise-700">Tendencias Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="actividades" fill="#14b8a6" />
                <Bar dataKey="participantes" fill="#0d9488" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de pastel - Categorías */}
        <Card className="turquoise-chart">
          <CardHeader>
            <CardTitle className="text-turquoise-700">Actividades por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Actividades recientes */}
      {reportData?.actividades_recientes && (
        <Card>
          <CardHeader>
            <CardTitle>Actividades Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.actividades_recientes.map((actividad) => (
                <div key={actividad.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{actividad.titulo}</h3>
                    <p className="text-sm text-gray-600">
                      {actividad.categoria} • {actividad.fecha_inicio}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={
                      actividad.estado === 'completada' ? 'default' : 
                      actividad.estado === 'en_progreso' ? 'secondary' : 'outline'
                    }>
                      {actividad.estado}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {actividad.participantes} participantes
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};