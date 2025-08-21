import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const SettingsPage = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Configuración General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Sistema
                </label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  defaultValue="VoluntariosGT"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email de Contacto
                </label>
                <input 
                  type="email" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  defaultValue="contacto@voluntarios.gt"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Notificaciones Push</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Emails Automáticos</span>
                <input type="checkbox" className="rounded" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Reportes Semanales</span>
                <input type="checkbox" className="rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Crear Usuario Admin</h3>
                <p className="text-sm text-gray-600">Registrar nuevo administrador del sistema</p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Crear Admin
              </button>
            </div>
            
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">Exportar Datos</h3>
                <p className="text-sm text-gray-600">Respaldar información del sistema</p>
              </div>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Exportar
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};