import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const CertificatesPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Gestión de Certificados</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Certificados Emitidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">1,458</div>
            <p className="text-sm text-gray-600">Total generados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Este Mes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">89</div>
            <p className="text-sm text-gray-600">Nuevos certificados</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Pendientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">23</div>
            <p className="text-sm text-gray-600">Por generar</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Generación de Certificados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Certificado Individual</h3>
                <p className="text-sm text-gray-600">Generar certificado para un voluntario específico</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Generar
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Certificados Masivos</h3>
                <p className="text-sm text-gray-600">Generar múltiples certificados por actividad</p>
              </div>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Generar Lote
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};