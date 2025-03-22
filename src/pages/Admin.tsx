import React, { useState } from 'react';
import { Calendar, Search, Trash2, LogOut, Instagram, Sparkles, Filter, Edit, X, ChevronLeft } from 'lucide-react';

interface Appointment {
  date: string;
  day: string;
  time: string;
  clientName: string | null;
  clientSurname: string | null;
  phoneNumber: string | null;
  instagram: string | null;
  serviceType: 'ricostruzione' | 'semipermanente' | 'refill' | 'copertura' | 'smontaggio' | null;
}

interface EditModalProps {
  appointment: Appointment;
  onSave: (updatedAppointment: Appointment) => void;
  onClose: () => void;
}

const EditModal: React.FC<EditModalProps> = ({ appointment, onSave, onClose }) => {
  const [editedAppointment, setEditedAppointment] = useState(appointment);
  const [fullName, setFullName] = useState(`${appointment.clientName || ''} ${appointment.clientSurname || ''}`);

  const handleSave = () => {
    const [firstName, ...lastNameParts] = fullName.trim().split(' ');
    const lastName = lastNameParts.join(' ');
    
    onSave({
      ...editedAppointment,
      clientName: firstName || null,
      clientSurname: lastName || null
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-pink-800">
            Modifica Appuntamento
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
            <input
              type="text"
              className="w-full p-2 border border-pink-200 rounded-lg"
              value={editedAppointment.date}
              onChange={(e) => setEditedAppointment({ ...editedAppointment, date: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ora</label>
            <input
              type="text"
              className="w-full p-2 border border-pink-200 rounded-lg"
              value={editedAppointment.time}
              onChange={(e) => setEditedAppointment({ ...editedAppointment, time: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome e Cognome</label>
            <input
              type="text"
              className="w-full p-2 border border-pink-200 rounded-lg"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
            <div className="relative">
              <span className="absolute left-2 top-2 text-gray-500">@</span>
              <input
                type="text"
                className="w-full p-2 pl-7 border border-pink-200 rounded-lg"
                value={editedAppointment.instagram || ''}
                onChange={(e) => setEditedAppointment({ ...editedAppointment, instagram: e.target.value || null })}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
            <input
              type="tel"
              className="w-full p-2 border border-pink-200 rounded-lg"
              value={editedAppointment.phoneNumber || ''}
              onChange={(e) => setEditedAppointment({ ...editedAppointment, phoneNumber: e.target.value || null })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Servizio</label>
            <select
              className="w-full p-2 border border-pink-200 rounded-lg"
              value={editedAppointment.serviceType || ''}
              onChange={(e) => setEditedAppointment({ 
                ...editedAppointment, 
                serviceType: e.target.value as Appointment['serviceType'] || null 
              })}
            >
              <option value="">Seleziona servizio</option>
              <option value="ricostruzione">Ricostruzione</option>
              <option value="semipermanente">Semipermanente</option>
              <option value="refill">Refill</option>
              <option value="copertura">Copertura in gel</option>
              <option value="smontaggio">Smontaggio</option>
            </select>
          </div>
        </div>
        <div className="flex gap-2 mt-6">
          <button
            className="flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            onClick={handleSave}
          >
            Salva
          </button>
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
};

const Admin: React.FC<{ 
  appointments: Appointment[], 
  onDeleteAppointment: (appointment: Appointment) => void,
  onUpdateAppointment?: (oldAppointment: Appointment, newAppointment: Appointment) => void
}> = ({ 
  appointments,
  onDeleteAppointment,
  onUpdateAppointment 
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [filterService, setFilterService] = useState<Appointment['serviceType']>(null);
  const [error, setError] = useState('');
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);

  const handleLogin = () => {
    // Password semplice per demo - in produzione usare un sistema più sicuro
    if (password === 'admin123') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Password non corretta');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
  };

  const handleDelete = (appointment: Appointment) => {
    setDeletingAppointment(appointment);
  };

  const confirmDelete = () => {
    if (deletingAppointment) {
      onDeleteAppointment(deletingAppointment);
      setDeletingAppointment(null);
    }
  };

  const handleSaveEdit = (updatedAppointment: Appointment) => {
    if (onUpdateAppointment && editingAppointment) {
      onUpdateAppointment(editingAppointment, updatedAppointment);
    }
    setEditingAppointment(null);
  };

  const filteredAppointments = appointments
    .filter(apt => searchDate ? apt.date.includes(searchDate) : true)
    .filter(apt => filterService ? apt.serviceType === filterService : true)
    .sort((a, b) => {
      const dateComparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      if (dateComparison === 0) {
        return a.time.localeCompare(b.time);
      }
      return dateComparison;
    });

  const getServiceColor = (serviceType: Appointment['serviceType']) => {
    switch(serviceType) {
      case 'ricostruzione': return 'text-purple-600';
      case 'semipermanente': return 'text-blue-600';
      case 'refill': return 'text-green-600';
      case 'copertura': return 'text-orange-600';
      case 'smontaggio': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-pink-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h2 className="text-2xl font-semibold text-pink-800 mb-6 text-center">
            Accesso Admin
          </h2>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Password"
              className="w-full p-2 border border-pink-200 rounded-lg"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button
              className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
              onClick={handleLogin}
            >
              Accedi
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Torna alla Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-pink-800 flex items-center gap-2">
            <Calendar className="w-8 h-8" />
            Gestione Appuntamenti
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <ChevronLeft className="w-4 h-4" />
              Torna alla Home
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca per data (es. 24/03/2025)"
                className="w-full pl-10 p-2 border border-pink-200 rounded-lg"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="pl-10 p-2 border border-pink-200 rounded-lg appearance-none pr-8"
                value={filterService || ''}
                onChange={(e) => setFilterService(e.target.value as Appointment['serviceType'] || null)}
              >
                <option value="">Tutti i servizi</option>
                <option value="ricostruzione">Ricostruzione</option>
                <option value="semipermanente">Semipermanente</option>
                <option value="refill">Refill</option>
                <option value="copertura">Copertura in gel</option>
                <option value="smontaggio">Smontaggio</option>
              </select>
              <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-pink-50">
                  <th className="px-4 py-2 text-left text-pink-800">Data</th>
                  <th className="px-4 py-2 text-left text-pink-800">Giorno</th>
                  <th className="px-4 py-2 text-left text-pink-800">Ora</th>
                  <th className="px-4 py-2 text-left text-pink-800">Cliente</th>
                  <th className="px-4 py-2 text-left text-pink-800">Instagram</th>
                  <th className="px-4 py-2 text-left text-pink-800">Telefono</th>
                  <th className="px-4 py-2 text-left text-pink-800">Servizio</th>
                  <th className="px-4 py-2 text-center text-pink-800">Azioni</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((apt, index) => (
                  <tr 
                    key={`${apt.date}-${apt.time}-${index}`}
                    className="border-b border-pink-100 hover:bg-pink-50"
                  >
                    <td className="px-4 py-2">{apt.date}</td>
                    <td className="px-4 py-2">{apt.day}</td>
                    <td className="px-4 py-2">{apt.time}</td>
                    <td className="px-4 py-2">
                      {apt.clientName ? `${apt.clientName} ${apt.clientSurname}` : '-'}
                    </td>
                    <td className="px-4 py-2">
                      {apt.instagram ? (
                        <div className="flex items-center gap-1">
                          <Instagram className="w-4 h-4" />
                          @{apt.instagram}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-2">{apt.phoneNumber || '-'}</td>
                    <td className="px-4 py-2">
                      {apt.serviceType ? (
                        <div className={`flex items-center gap-1 ${getServiceColor(apt.serviceType)}`}>
                          <Sparkles className="w-4 h-4" />
                          {apt.serviceType.charAt(0).toUpperCase() + apt.serviceType.slice(1)}
                        </div>
                      ) : '-'}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(apt)}
                          className="text-blue-500 hover:text-blue-700"
                          title="Modifica"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        {apt.clientName && (
                          <button
                            onClick={() => handleDelete(apt)}
                            className="text-red-500 hover:text-red-700"
                            title="Elimina"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingAppointment && (
        <EditModal
          appointment={editingAppointment}
          onSave={handleSaveEdit}
          onClose={() => setEditingAppointment(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-red-600 mb-4">
                Conferma Cancellazione
              </h3>
              <p className="text-gray-700 mb-6">
                Sei sicuro di voler cancellare l'appuntamento di{' '}
                <span className="font-semibold">{deletingAppointment.clientName} {deletingAppointment.clientSurname}</span>{' '}
                del {deletingAppointment.day} {deletingAppointment.date} alle {deletingAppointment.time}?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  onClick={confirmDelete}
                >
                  Sì, Cancella
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                  onClick={() => setDeletingAppointment(null)}
                >
                  No, Mantieni
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin; 