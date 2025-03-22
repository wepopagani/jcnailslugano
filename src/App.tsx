import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Sparkles, Shield, Instagram, UserX, Check, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import Admin from './pages/Admin';
import { Helmet } from 'react-helmet';

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

interface Service {
  name: string;
  price: string;
}

function App() {
  const [isAdminView, setIsAdminView] = useState(false);
  
  // Imposto la data di inizio alla prossima settimana
  const getInitialWeekStart = () => {
    const today = new Date();
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + (8 - today.getDay()) % 7);
    nextMonday.setHours(0, 0, 0, 0);
    return nextMonday;
  };

  const [currentWeekStart, setCurrentWeekStart] = useState(getInitialWeekStart());
  const [isWeekSelectorOpen, setIsWeekSelectorOpen] = useState(false);
  const services: Service[] = [
    { name: "Semipermanente", price: "35 CHF" },
    { name: "Ricostruzione base", price: "60 CHF" },
    { name: "Ricostruzione M", price: "+5 CHF" },
    { name: "Ricostruzione L", price: "+10 CHF" },
    { name: "Ricostruzione XL", price: "+15 CHF" },
    { name: "Smontaggio", price: "+10 CHF" },
    { name: "Smontaggio completo", price: "20 CHF" },
    { name: "French/babyboomer", price: "+10 CHF" },
    { name: "Decorazioni, charm, brillantini", price: "+5 CHF" },
    { name: "Refill", price: "50 CHF" },
    { name: "Copertura in gel", price: "45 CHF" }
  ];

  const generateAppointments = (baseDate: Date) => {
    const appointments: Appointment[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + i);
      const dayName = currentDate.toLocaleDateString('it-IT', { weekday: 'long' });
      const dateStr = currentDate.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      
      if (dayName === 'lunedì') {
        appointments.push({
          date: dateStr,
          day: capitalizedDay,
          time: '10:00',
          clientName: null,
          clientSurname: null,
          phoneNumber: null,
          instagram: null,
          serviceType: null
        });
      } else if (['mercoledì', 'venerdì', 'sabato'].includes(dayName)) {
        appointments.push({
          date: dateStr,
          day: capitalizedDay,
          time: '17:00',
          clientName: null,
          clientSurname: null,
          phoneNumber: null,
          instagram: null,
          serviceType: null
        });
      } else if (dayName === 'domenica') {
        appointments.push({
          date: dateStr,
          day: capitalizedDay,
          time: '10:00',
          clientName: null,
          clientSurname: null,
          phoneNumber: null,
          instagram: null,
          serviceType: null
        });
      }
    }
    
    return appointments;
  };

  const [appointments, setAppointments] = useState<Appointment[]>(generateAppointments(currentWeekStart));
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [fullName, setFullName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [serviceType, setServiceType] = useState<Appointment['serviceType']>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>('10:00');

  const navigateWeek = (direction: 'prev' | 'next') => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newDate = new Date(currentWeekStart);
    if (direction === 'next') {
      newDate.setDate(newDate.getDate() + 7);
      setCurrentWeekStart(newDate);
      setAppointments(generateAppointments(newDate));
    } else {
      newDate.setDate(newDate.getDate() - 7);
      // Permetti di andare indietro solo se la nuova data è nel futuro
      if (newDate >= today) {
        setCurrentWeekStart(newDate);
        setAppointments(generateAppointments(newDate));
      }
    }
  };

  const bookAppointment = () => {
    if (selectedAppointment && fullName && phoneNumber && instagram && serviceType) {
      const [firstName, ...lastNameParts] = fullName.trim().split(' ');
      const lastName = lastNameParts.join(' ');
      
      setAppointments(appointments.map(apt => 
        apt.date === selectedAppointment.date
          ? { 
              ...apt, 
              time: selectedTime,
              clientName: firstName,
              clientSurname: lastName,
              phoneNumber,
              instagram,
              serviceType
            }
          : apt
      ));
      setSelectedAppointment(null);
      setShowSuccess(true);
      setSelectedTime('10:00');
    }
  };

  const deleteAppointment = (appointmentToDelete: Appointment) => {
    setAppointments(appointments.map(apt => 
      apt.date === appointmentToDelete.date && apt.time === appointmentToDelete.time
        ? { ...apt, clientName: null, clientSurname: null, phoneNumber: null, instagram: null, serviceType: null }
        : apt
    ));
  };

  const updateAppointment = (oldAppointment: Appointment, newAppointment: Appointment) => {
    setAppointments(appointments.map(apt => 
      apt.date === oldAppointment.date && apt.time === oldAppointment.time
        ? newAppointment
        : apt
    ));
  };

  const generateCalendarLink = (appointment: Appointment | null) => {
    if (!appointment) return '';
    
    const [day, month, year] = appointment.date.split('/');
    const [hours, minutes] = appointment.time.split(':');
    
    // Creo la data di inizio
    const startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    // Aggiungo un'ora per la fine dell'appuntamento
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d+/g, '');
    };
    
    const event = {
      title: `Appuntamento JC Nails - ${serviceType} - ${appointment.date}`,
      start: formatDate(startDate),
      end: formatDate(endDate),
      description: `Appuntamento per ${serviceType} da JC Nails Lugano\nInstagram: @jcnailslugano\nTel: 0766070544\n\nVia Ferruccio Pelli 14, 6° piano\n6900 Lugano`,
      location: 'Via Ferruccio Pelli 14, 6900 Lugano, Svizzera',
    };
    
    const calendarUrl = `data:text/calendar;charset=utf-8,BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
URL:https://jcnails.ch
DTSTART:${event.start}
DTEND:${event.end}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR`;

    return encodeURI(calendarUrl);
  };

  if (isAdminView) {
    return <Admin 
      appointments={appointments} 
      onDeleteAppointment={deleteAppointment}
      onUpdateAppointment={updateAppointment}
    />;
  }

  return (
    <div className="min-h-screen bg-pink-50">
      <Helmet>
        <title>JC Nails Lugano - Centro Specializzato Ricostruzione Unghie e Nail Art | Semipermanente | Refill</title>
        <meta name="description" content="JC Nails Lugano: centro estetico specializzato in ricostruzione unghie, semipermanente, nail art e refill. Servizi professionali di manicure e pedicure a Lugano. Tecniche innovative, prodotti di qualità e design personalizzati. Prenota online il tuo appuntamento." />
        <meta name="keywords" content="ricostruzione unghie Lugano, nail art Ticino, semipermanente Lugano, JC Nails, unghie gel Lugano, nail salon Svizzera, ricostruzione unghie professionale, french manicure, babyboomer nails, refill unghie, copertura in gel, estetista Lugano, manicure Lugano, pedicure Lugano, unghie sposa Lugano, decorazione unghie, brillantini unghie, nail design Ticino, unghie artistiche, extension unghie, ricostruzione naturale, gel unghie, acrilico unghie, smalto semipermanente, centro estetico Lugano, nail bar Lugano, migliore nail artist Lugano, unghie su misura, trattamenti unghie, cura mani, cura unghie, tendenze unghie, nail trends, unghie fashion" />
        
        {/* Meta tag aggiuntivi */}
        <meta name="author" content="JC Nails Lugano" />
        <meta name="robots" content="index, follow" />
        <meta name="language" content="it-IT" />
        <meta name="revisit-after" content="7 days" />
        <meta name="rating" content="safe for kids" />
        <meta name="geo.region" content="CH-TI" />
        <meta name="geo.placename" content="Lugano" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="JC Nails Lugano - Centro Professionale Ricostruzione Unghie e Nail Art" />
        <meta property="og:description" content="Centro specializzato in ricostruzione unghie, semipermanente e nail art a Lugano. Design personalizzati, tecniche innovative e prodotti di alta qualità. Prenota il tuo appuntamento online." />
        <meta property="og:image" content="/logo.png" />
        <meta property="og:site_name" content="JC Nails Lugano" />
        <meta property="og:locale" content="it_IT" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="JC Nails Lugano - Nail Art e Ricostruzione Unghie" />
        <meta name="twitter:description" content="Servizi professionali di nail art e ricostruzione unghie a Lugano. Esperienza, qualità e design personalizzato per le tue unghie." />
        <meta name="twitter:image" content="/logo.png" />
        
        {/* Favicon e icone */}
        <link rel="icon" type="image/png" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        
        {/* Dati strutturati per Google */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "NailSalon",
            "name": "JC Nails Lugano",
            "image": "/logo.png",
            "logo": "/logo.png",
            "@id": "https://jcnails.ch",
            "url": "https://jcnails.ch",
            "telephone": "+41766070544",
            "priceRange": "$$",
            "description": "Centro professionale specializzato in ricostruzione unghie, semipermanente, nail art e trattamenti estetici a Lugano",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Via Ferruccio Pelli 14, 6° piano",
              "addressLocality": "Lugano",
              "addressRegion": "Ticino",
              "postalCode": "6900",
              "addressCountry": "CH"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "46.0037",
              "longitude": "8.9511"
            },
            "openingHours": [
              "Mo 10:00-19:00",
              "We 17:00-20:00",
              "Fr 17:00-20:00",
              "Sa 17:00-20:00",
              "Su 10:00-13:00"
            ],
            "sameAs": [
              "https://instagram.com/jcnailslugano"
            ],
            "offers": {
              "@type": "AggregateOffer",
              "offers": [
                {
                  "@type": "Offer",
                  "name": "Semipermanente",
                  "price": "35",
                  "priceCurrency": "CHF"
                },
                {
                  "@type": "Offer",
                  "name": "Ricostruzione base",
                  "price": "60",
                  "priceCurrency": "CHF"
                },
                {
                  "@type": "Offer",
                  "name": "Refill",
                  "price": "50",
                  "priceCurrency": "CHF"
                }
              ]
            },
            "makesOffer": {
              "@type": "Offer",
              "itemOffered": [
                {
                  "@type": "Service",
                  "name": "Ricostruzione Unghie",
                  "description": "Servizio professionale di ricostruzione unghie con tecniche innovative"
                },
                {
                  "@type": "Service",
                  "name": "Nail Art",
                  "description": "Design personalizzati e decorazioni artistiche per le tue unghie"
                },
                {
                  "@type": "Service",
                  "name": "Semipermanente",
                  "description": "Applicazione di smalto semipermanente di alta qualità"
                }
              ]
            }
          })}
        </script>
      </Helmet>

      {/* Header */}
      <header className="bg-gradient-to-b from-pink-100 to-pink-50 shadow-md py-4 md:py-8">
        <div className="container mx-auto px-4">
          <div className="text-center relative">
            <button
              onClick={() => setIsAdminView(true)}
              className="absolute right-2 top-2 md:right-4 md:top-4 p-2 rounded-full hover:bg-pink-200 transition-colors"
              title="Area Admin"
            >
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-pink-800" />
            </button>
            <h1 className="font-serif italic">
              <span className="block text-4xl md:text-6xl bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent font-bold mb-1 md:mb-2">
                JC
              </span>
              <span className="block text-3xl md:text-5xl bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent font-bold">
                NAILS
              </span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 md:py-8 space-y-6 md:space-y-8">
        {/* Appointments Section */}
        <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-pink-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 md:w-6 md:h-6" />
              Disponibilità Appuntamenti
            </h2>
            <div className="flex items-center justify-center gap-2 md:gap-4">
              <button
                onClick={() => navigateWeek('prev')}
                className="p-2 rounded-full hover:bg-pink-100 transition-colors"
                title="Settimana precedente"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-pink-600" />
              </button>
              <div className="relative">
                <button
                  onClick={() => setIsWeekSelectorOpen(!isWeekSelectorOpen)}
                  className="text-sm md:text-base text-pink-800 font-medium px-4 py-2 rounded-lg hover:bg-pink-50 transition-colors flex items-center gap-2"
                >
                  <span>
                    {currentWeekStart.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {
                      new Date(currentWeekStart.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    }
                  </span>
                  <ChevronRight className={`w-4 h-4 transition-transform ${isWeekSelectorOpen ? 'rotate-90' : ''}`} />
                </button>
                
                {isWeekSelectorOpen && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-pink-100 z-10">
                    {[...Array(4)].map((_, index) => {
                      const weekStart = new Date(currentWeekStart.getTime());
                      weekStart.setDate(weekStart.getDate() + (index * 7));
                      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
                      
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentWeekStart(weekStart);
                            setAppointments(generateAppointments(weekStart));
                            setIsWeekSelectorOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-pink-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {weekStart.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {
                            weekEnd.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          }
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <button
                onClick={() => navigateWeek('next')}
                className="p-2 rounded-full hover:bg-pink-100 transition-colors"
                title="Settimana successiva"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-pink-600" />
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {appointments
              .filter(apt => !apt.clientName)
              .map((apt, index) => (
                <div 
                  key={`${apt.date}-${apt.time}-${index}`}
                  className="p-4 rounded-lg border bg-white border-pink-200 hover:border-pink-400 cursor-pointer"
                  onClick={() => setSelectedAppointment(apt)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-pink-800">
                        {apt.day} - {apt.date}
                        {apt.day === 'Lunedì' && (
                          <span className="ml-2 text-sm bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">
                            3 slot
                          </span>
                        )}
                      </span>
                    </div>
                    <Clock className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="text-2xl font-bold text-pink-700">
                    {apt.day === 'Lunedì' ? 'Scegli orario' : apt.time}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Price List Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-pink-800 mb-6 flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            Listino Prezzi
          </h2>
          <div className="space-y-2">
            {services.map((service, index) => (
              <div 
                key={index}
                className="flex justify-between items-center p-3 border border-pink-100 rounded-lg hover:bg-pink-50 transition-colors"
              >
                <span className="text-pink-800">{service.name}</span>
                <span className="font-semibold text-pink-700">{service.price}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-t from-pink-100 to-pink-50 py-12 mt-8 pb-24">
        <div className="container mx-auto px-4">
          <h3 className="text-xl font-semibold text-pink-800 mb-4 text-center">
            Policy del Salone
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-center mb-2 text-pink-600">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-center text-gray-700">
                Si prega di disdire con 24 ore di anticipo
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-center mb-2 text-pink-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-center text-gray-700">
                Il prezzo del refill varia in base alla lunghezza
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
              <div className="flex items-center justify-center mb-2 text-pink-600">
                <UserX className="w-6 h-6" />
              </div>
              <p className="text-center text-gray-700">
                No Accompagnatori
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 p-3 rounded-full">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
              </div>
              <h3 className="text-2xl font-semibold text-green-600 mb-2">
                Prenotazione Confermata!
              </h3>
              <div className="space-y-4 mt-6">
                <div className="flex items-center justify-center gap-2 text-green-600">
                  <Check className="w-5 h-5" />
                  <p>Ti aspettiamo il {selectedAppointment?.day} {selectedAppointment?.date} alle {selectedTime}</p>
                </div>
                <a
                  href={generateCalendarLink(selectedAppointment)}
                  className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  download="appuntamento-jc-nails.ics"
                >
                  📅 Aggiungi al Calendario
                </a>
                <p className="text-gray-600">
                  Se hai ulteriori domande o chiarimenti contattaci:
                </p>
                <div className="flex items-center justify-center gap-6">
                  <a 
                    href="https://instagram.com/jcnailslugano" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-pink-600 hover:text-pink-700"
                  >
                    <Instagram className="w-5 h-5" />
                    @jcnailslugano
                  </a>
                  <a 
                    href="tel:0766070544"
                    className="flex items-center gap-2 text-pink-600 hover:text-pink-700"
                  >
                    <Phone className="w-5 h-5" />
                    0766070544
                  </a>
                </div>
              </div>
              <button
                className="mt-6 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                onClick={() => {
                  setShowSuccess(false);
                  setFullName('');
                  setInstagram('');
                  setPhoneNumber('');
                  setServiceType(null);
                }}
              >
                Chiudi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selectedAppointment && !showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-pink-800 mb-4">
              Prenota Appuntamento
            </h3>
            <p className="mb-4 text-gray-600">
              {selectedAppointment.day} {selectedAppointment.date}
              {selectedAppointment.day === 'Lunedì' ? (
                <div className="mt-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seleziona Orario:
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full p-2 border border-pink-200 rounded-lg bg-white"
                  >
                    <option value="10:00">10:00</option>
                    <option value="14:30">14:30</option>
                    <option value="17:00">17:00</option>
                  </select>
                </div>
              ) : (
                ` alle ${selectedAppointment.time}`
              )}
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome e Cognome"
                className="w-full p-2 border border-pink-200 rounded-lg"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <div className="relative">
                <span className="absolute left-2 top-2 text-gray-500">@</span>
                <input
                  type="text"
                  placeholder="Instagram (facoltativo)"
                  className="w-full p-2 pl-7 border border-pink-200 rounded-lg"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                />
              </div>
              <input
                type="tel"
                placeholder="Numero di Telefono"
                className="w-full p-2 border border-pink-200 rounded-lg"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
              
              <div className="space-y-2">
                <p className="font-medium text-gray-700">Seleziona Servizio:</p>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: 'ricostruzione', label: 'Ricostruzione' },
                    { id: 'semipermanente', label: 'Semipermanente' },
                    { id: 'refill', label: 'Refill' },
                    { id: 'copertura', label: 'Copertura in gel' },
                    { id: 'smontaggio', label: 'Smontaggio' }
                  ].map((service) => (
                    <label
                      key={service.id}
                      className={`flex items-center p-2 rounded-lg border cursor-pointer transition-colors ${
                        serviceType === service.id
                          ? 'bg-pink-100 border-pink-400'
                          : 'border-gray-200 hover:border-pink-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="service"
                        value={service.id}
                        checked={serviceType === service.id}
                        onChange={(e) => setServiceType(e.target.value as Appointment['serviceType'])}
                        className="hidden"
                      />
                      <span className="ml-2">{service.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={bookAppointment}
                disabled={!fullName || !phoneNumber || !instagram || !serviceType}
              >
                Conferma
              </button>
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => {
                  setSelectedAppointment(null);
                  setFullName('');
                  setInstagram('');
                  setPhoneNumber('');
                  setServiceType(null);
                }}
              >
                Annulla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;