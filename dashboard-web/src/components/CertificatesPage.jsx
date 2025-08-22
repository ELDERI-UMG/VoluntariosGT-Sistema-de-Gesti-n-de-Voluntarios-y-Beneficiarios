import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { DataService } from '../lib/dataService.js';
import { 
  Search, 
  Download, 
  FileText, 
  Users, 
  Calendar, 
  Award,
  Filter,
  Plus,
  RefreshCw
} from 'lucide-react';

export const CertificatesPage = () => {
  const [data, setData] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingActions, setLoadingActions] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [showGenerateForm, setShowGenerateForm] = useState(false);

  // Cargar datos iniciales
  useEffect(() => {
    loadCertificatesData();
  }, []);

  // Buscar certificados cuando cambie la query
  useEffect(() => {
    if (data) {
      searchCertificates();
    }
  }, [searchQuery, filters, data]);

  const loadCertificatesData = async () => {
    try {
      setLoading(true);
      const response = await DataService.getCertificatesData();
      
      // Validar y normalizar datos
      const normalizedData = {
        estadisticas: {
          total_emitidos: response?.estadisticas?.total_emitidos || 0,
          este_mes: response?.estadisticas?.este_mes || 0,
          pendientes: response?.estadisticas?.pendientes || 0,
          templates_activos: response?.estadisticas?.templates_activos || 0
        },
        certificados_recientes: response?.certificados_recientes || [],
        templates: response?.templates || []
      };
      
      setData(normalizedData);
      setCertificates(normalizedData.certificados_recientes);
      
    } catch (error) {
      console.error('Error cargando certificados:', error);
      
      // Datos de fallback seguros
      const fallbackData = {
        estadisticas: {
          total_emitidos: 0,
          este_mes: 0,
          pendientes: 0,
          templates_activos: 0
        },
        certificados_recientes: [],
        templates: []
      };
      
      setData(fallbackData);
      setCertificates([]);
      
    } finally {
      setLoading(false);
    }
  };

  const searchCertificates = async () => {
    try {
      const results = await DataService.searchCertificates(searchQuery, filters);
      setCertificates(results);
    } catch (error) {
      console.error('Error buscando certificados:', error);
    }
  };

  // Generar certificado individual
  const handleGenerateIndividual = async (certificateData) => {
    setLoadingActions({ ...loadingActions, individual: true });
    
    try {
      const result = await DataService.generateCertificate(certificateData);
      if (result.success) {
        alert(`✅ ${result.message}`);
        await loadCertificatesData(); // Recargar datos
        setShowGenerateForm(false);
      }
    } catch (error) {
      alert(`❌ Error generando certificado: ${error.message}`);
    }
    
    setLoadingActions({ ...loadingActions, individual: false });
  };

  // Generar lote de certificados
  const handleGenerateBatch = async () => {
    setLoadingActions({ ...loadingActions, batch: true });
    
    try {
      const result = await DataService.generateBatchCertificates('demo-activity');
      if (result.success) {
        alert(`✅ ${result.message}`);
        await loadCertificatesData();
      }
    } catch (error) {
      alert(`❌ Error generando lote: ${error.message}`);
    }
    
    setLoadingActions({ ...loadingActions, batch: false });
  };

  // Componente de formulario de generación
  const GenerateForm = () => {
    const [formData, setFormData] = useState({
      voluntario: '',
      actividad: '',
      horas: '',
      template: 'Medio Ambiente'
    });

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generar Certificado Individual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre del Voluntario</label>
              <Input
                value={formData.voluntario}
                onChange={(e) => setFormData({...formData, voluntario: e.target.value})}
                placeholder="Ej: María González"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Actividad</label>
              <Input
                value={formData.actividad}
                onChange={(e) => setFormData({...formData, actividad: e.target.value})}
                placeholder="Ej: Jornada de Reforestación"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Horas Completadas</label>
              <Input
                type="number"
                value={formData.horas}
                onChange={(e) => setFormData({...formData, horas: e.target.value})}
                placeholder="8"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Template</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={formData.template}
                onChange={(e) => setFormData({...formData, template: e.target.value})}
              >
                <option value="Medio Ambiente">Medio Ambiente</option>
                <option value="Salud">Salud</option>
                <option value="Educación">Educación</option>
                <option value="Social">Social</option>
              </select>
            </div>
          </div>
          <div className="flex space-x-2 mt-4">
            <Button 
              onClick={() => handleGenerateIndividual(formData)}
              disabled={loadingActions.individual || !formData.voluntario || !formData.actividad}
              className="btn-turquoise"
            >
              {loadingActions.individual ? '⏳ Generando...' : '📄 Generar Certificado'}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowGenerateForm(false)}
              className="btn-turquoise-outline"
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Certificados</h1>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando certificados...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Certificados</h1>
        <Button onClick={loadCertificatesData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Estadísticas principales */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="stats-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Award className="h-5 w-5 text-turquoise-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Emitidos</p>
                  <p className="text-2xl font-bold text-turquoise-600">{(data.estadisticas?.total_emitidos || 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="stats-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-turquoise-500" />
                <div>
                  <p className="text-sm text-gray-600">Este Mes</p>
                  <p className="text-2xl font-bold text-turquoise-500">{data.estadisticas?.este_mes || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="stats-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-amber-500" />
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-amber-500">{data.estadisticas?.pendientes || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="stats-card">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-turquoise-400" />
                <div>
                  <p className="text-sm text-gray-600">Templates</p>
                  <p className="text-2xl font-bold text-turquoise-400">{data.estadisticas?.templates_activos || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Acciones rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="turquoise-card">
          <CardHeader>
            <CardTitle className="text-turquoise-700">Generación de Certificados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Certificado Individual</h3>
                  <p className="text-sm text-gray-600">Generar certificado para un voluntario específico</p>
                </div>
                <Button 
                  onClick={() => setShowGenerateForm(true)}
                  disabled={loadingActions.individual}
                  className="btn-turquoise"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Generar
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">Certificados Masivos</h3>
                  <p className="text-sm text-gray-600">Generar múltiples certificados por actividad</p>
                </div>
                <Button 
                  onClick={handleGenerateBatch}
                  disabled={loadingActions.batch}
                  className="btn-turquoise-outline"
                >
                  {loadingActions.batch ? '⏳ Generando...' : '👥 Generar Lote'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates disponibles */}
        <Card className="turquoise-card">
          <CardHeader>
            <CardTitle className="text-turquoise-700">Templates Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data?.templates?.filter(t => t.activo).map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{template.nombre}</h4>
                    <p className="text-sm text-gray-600">{template.descripcion}</p>
                  </div>
                  <Badge variant="outline">
                    {template.usos} usos
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulario de generación */}
      {showGenerateForm && <GenerateForm />}

      {/* Búsqueda y filtros */}
      <Card className="turquoise-card">
        <CardHeader>
          <CardTitle className="text-turquoise-700">Certificados Emitidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10 turquoise-input"
                  placeholder="Buscar por voluntario, actividad o ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <select 
              className="px-3 py-2 turquoise-input"
              value={filters.estado || ''}
              onChange={(e) => setFilters({...filters, estado: e.target.value})}
            >
              <option value="">Todos los estados</option>
              <option value="emitido">Emitido</option>
              <option value="pendiente">Pendiente</option>
            </select>
          </div>

          {/* Lista de certificados */}
          <div className="space-y-3">
            {certificates.map((cert) => (
              <div key={cert.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-medium">{cert.voluntario}</h3>
                    <Badge variant={cert.estado === 'emitido' ? 'default' : 'secondary'}>
                      {cert.estado}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    {cert.actividad} • {cert.horas} horas • {cert.fecha_emision}
                  </p>
                  <p className="text-xs text-gray-500">
                    ID: {cert.id} • Template: {cert.template}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button size="sm" className="btn-turquoise-outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {certificates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron certificados con los criterios de búsqueda
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};