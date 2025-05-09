import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, Phone, Sparkles, Shield, Instagram, UserX, Check, CheckCircle, ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';
import Admin from './pages/Admin';
import { Helmet } from 'react-helmet';
import { db } from './firebase';
import { collection, query, getDocs, addDoc, updateDoc, doc, deleteDoc, where } from 'firebase/firestore';

interface Appointment {
  id?: string;
  date: string;
  day: string;
  time: string;
  clientName: string | null;
  clientSurname: string | null;
  clientEmail: string | null;
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
  
  // Aggiungo una funzione per verificare se un appuntamento è già passato
  const isAppointmentPassed = (dateOrAppointment: string | Appointment, time?: string) => {
    let date: string;
    let timeValue: string;
    
    if (typeof dateOrAppointment === 'string') {
      date = dateOrAppointment;
      timeValue = time || '00:00';
    } else {
      date = dateOrAppointment.date;
      timeValue = dateOrAppointment.time;
    }
    
    const now = new Date();
    const [day, month, year] = date.split('/').map(Number);
    const [hours, minutes] = timeValue.split(':').map(Number);
    
    const appointmentDate = new Date(year, month - 1, day, hours, minutes);
    return appointmentDate < now;
  };
  
  const getInitialWeekStart = () => {
    const today = new Date();
    const currentWeekStart = new Date(today);
    // Troviamo l'inizio della settimana corrente (lunedì)
    const dayOfWeek = currentWeekStart.getDay(); // 0 = domenica, 1 = lunedì, ...
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Se è domenica, torniamo indietro di 6 giorni
    currentWeekStart.setDate(today.getDate() + diffToMonday);
    currentWeekStart.setHours(0, 0, 0, 0);
    return currentWeekStart;
  };

  // Modifico la funzione per generare gli appuntamenti includendo il controllo del tempo passato
  const generateAppointments = (baseDate: Date) => {
    const appointments: Appointment[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(baseDate.getDate() + i);
      const dayName = currentDate.toLocaleDateString('it-IT', { weekday: 'long' });
      const dateStr = currentDate.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      
      if (dayName === 'lunedì') {
        ['10:00', '14:30', '17:00'].forEach(time => {
          // Non aggiungere appuntamenti passati
          if (!isAppointmentPassed(dateStr, time)) {
            appointments.push({
              date: dateStr,
              day: capitalizedDay,
              time: time,
              clientName: null,
              clientSurname: null,
              clientEmail: null,
              phoneNumber: null,
              instagram: null,
              serviceType: null
            });
          }
        });
      } else if (['mercoledì', 'venerdì', 'sabato'].includes(dayName)) {
        // Non aggiungere appuntamenti passati
        if (!isAppointmentPassed(dateStr, '17:00')) {
          appointments.push({
            date: dateStr,
            day: capitalizedDay,
            time: '17:00',
            clientName: null,
            clientSurname: null,
            clientEmail: null,
            phoneNumber: null,
            instagram: null,
            serviceType: null
          });
        }
      } else if (dayName === 'domenica') {
        // Non aggiungere appuntamenti passati
        if (!isAppointmentPassed(dateStr, '10:00')) {
          appointments.push({
            date: dateStr,
            day: capitalizedDay,
            time: '10:00',
            clientName: null,
            clientSurname: null,
            clientEmail: null,
            phoneNumber: null,
            instagram: null,
            serviceType: null
          });
        }
      }
    }
    
    return appointments;
  };

  // Funzione per trovare la prossima settimana con appuntamenti disponibili
  const findNextAvailableWeek = (startDate: Date, forward: boolean = true): Date => {
    const maxWeeks = 60; // Limite massimo di settimane future da controllare
    let currentDate = new Date(startDate);
    
    // Se andiamo avanti, partiamo dalla settimana successiva
    if (forward) {
      currentDate.setDate(currentDate.getDate() + 7);
    } else {
      // Se andiamo indietro, partiamo dalla settimana precedente
      currentDate.setDate(currentDate.getDate() - 7);
      
      // Non andare prima della settimana attuale
      const today = new Date();
      const mondayOfThisWeek = new Date(today);
      const dayOfWeek = today.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      mondayOfThisWeek.setDate(today.getDate() + diffToMonday);
      
      if (currentDate < mondayOfThisWeek && !isAdminView) {
        return mondayOfThisWeek;
      }
    }
    
    // Prima controlliamo se la settimana corrente ha appuntamenti
    const appointments = generateAppointments(currentDate);
    if (appointments.length > 0) {
      return currentDate;
    }
    
    // Altrimenti cerchiamo altre settimane
    for (let i = 1; i < maxWeeks; i++) {
      const testDate = new Date(currentDate);
      if (forward) {
        testDate.setDate(testDate.getDate() + (i * 7));
      } else {
        testDate.setDate(testDate.getDate() - (i * 7));
        
        // Non andare prima della settimana attuale
        const today = new Date();
        const mondayOfThisWeek = new Date(today);
        const dayOfWeek = today.getDay();
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        mondayOfThisWeek.setDate(today.getDate() + diffToMonday);
        
        if (testDate < mondayOfThisWeek && !isAdminView) {
          continue; // Salta questa iterazione e vai alla successiva
        }
      }
      
      // Verifica se questa settimana ha appuntamenti disponibili
      const appointments = generateAppointments(testDate);
      if (appointments.length > 0) {
        return testDate;
      }
    }
    
    // Se non troviamo settimane future disponibili, torniamo alla data originale
    return startDate;
  };

  // All'inizializzazione, assicuriamoci di iniziare da una settimana con appuntamenti disponibili
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const initialWeekStart = getInitialWeekStart();
    return findNextAvailableWeek(initialWeekStart);
  });
  const [isWeekSelectorOpen, setIsWeekSelectorOpen] = useState(false);
  const services: Service[] = [
    { name: "Semipermanente", price: "40 CHF" },
    { name: "Ricostruzione base", price: "60 CHF" },
    { name: "Ricostruzione S", price: "+5 CHF" },
    { name: "Ricostruzione M", price: "+10 CHF" },
    { name: "Ricostruzione L", price: "+15 CHF" },
    { name: "Ricostruzione XL", price: "+20 CHF" },
    { name: "Refill", price: "50 CHF" },
    { name: "Copertura in gel", price: "50 CHF" },
    { name: "Smontaggio", price: "+10 CHF" },
    { name: "Smontaggio completo", price: "20 CHF" },
    { name: "French/babyboomer", price: "+10 CHF" },
    { name: "Decorazioni, charm, brillantini", price: "+5 CHF" },

  ];

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    // Inizializziamo con gli appuntamenti generati
    return generateAppointments(getInitialWeekStart());
  });

  // Nuovo useEffect per caricare gli appuntamenti da Firebase
  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const appointmentsRef = collection(db, 'appointments');
        
        // Se siamo in vista admin, carica tutti gli appuntamenti senza filtri
        // altrimenti usa il filtro per settimana corrente
        const querySnapshot = await getDocs(appointmentsRef);
        
        const loadedAppointments = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Appointment[];

        // Funzione per verificare se un appuntamento è già passato
        const isPassedAppointment = (appointment: Appointment) => {
          return isAppointmentPassed(appointment);
        };

        // Elimina dal database gli appuntamenti passati
        const deletePassedAppointments = async () => {
          const passedAppointments = loadedAppointments.filter(isPassedAppointment);
          
          for (const apt of passedAppointments) {
            if (apt.id) {
              try {
                const appointmentRef = doc(db, 'appointments', apt.id);
                await deleteDoc(appointmentRef);
                console.log(`Appuntamento passato eliminato: ${apt.date} ${apt.time}`);
              } catch (error) {
                console.error('Errore nell\'eliminazione di un appuntamento passato:', error);
              }
            }
          }
        };

        // Esegui la pulizia se non siamo in vista admin
        if (!isAdminView) {
          deletePassedAppointments();
        }

        if (isAdminView) {
          // In vista admin, usa tutti gli appuntamenti caricati
          setAppointments(loadedAppointments);
        } else {
          // In vista cliente, filtra per la settimana corrente e rimuovi quelli passati
          const generatedAppointments = generateAppointments(currentWeekStart);
          
          // Filtra gli appuntamenti generati per rimuovere quelli passati
          const filteredGeneratedAppointments = generatedAppointments.filter(apt => !isAppointmentPassed(apt));
          
          const mergedAppointments = filteredGeneratedAppointments.map(genApt => {
            const existingApt = loadedAppointments.find(
              loadedApt => loadedApt.date === genApt.date && loadedApt.time === genApt.time
            );
            return existingApt || genApt;
          }).filter(apt => !isAppointmentPassed(apt)); // Filtro finale per rimuovere appuntamenti passati

          setAppointments(mergedAppointments);
        }
      } catch (error) {
        console.error('Errore nel caricamento degli appuntamenti:', error);
        // In caso di errore generale, usa gli appuntamenti generati localmente
        const generatedAppointments = generateAppointments(currentWeekStart)
          .filter(apt => !isAppointmentPassed(apt));
        setAppointments(generatedAppointments);
      }
    };

    loadAppointments();
  }, [currentWeekStart, isAdminView]);

  // Dopo l'hook useEffect esistente per caricare gli appuntamenti
  useEffect(() => {
    // Verifica se ci sono appuntamenti salvati in locale da sincronizzare
    const syncFailedAppointments = async () => {
      try {
        const failedAppointments = JSON.parse(localStorage.getItem('failedAppointments') || '[]') as (Appointment & { timestamp: string })[];
        
        if (failedAppointments.length > 0) {
          console.log(`Tentativo di sincronizzazione di ${failedAppointments.length} appuntamenti falliti`);
          
          // Filtra appuntamenti più vecchi di 24 ore
          const now = new Date().getTime();
          const validAppointments = failedAppointments.filter(apt => {
            const timestamp = new Date(apt.timestamp).getTime();
            return (now - timestamp) < 24 * 60 * 60 * 1000; // 24 ore in millisecondi
          });
          
          // Salva gli appuntamenti validi
          for (const apt of validAppointments) {
            try {
              const { timestamp, ...appointmentData } = apt;
              const appointmentsRef = collection(db, 'appointments');
              await addDoc(appointmentsRef, appointmentData);
              console.log('Appuntamento sincronizzato con successo:', apt);
            } catch (error) {
              console.error('Errore durante la sincronizzazione:', error);
            }
          }
          
          // Aggiorna il localStorage con solo gli appuntamenti che non siamo riusciti a sincronizzare
          localStorage.setItem('failedAppointments', JSON.stringify(
            validAppointments.filter(apt => !validAppointments.includes(apt))
          ));
        }
      } catch (error) {
        console.error('Errore nel processo di sincronizzazione:', error);
      }
    };
    
    // Controlla la connessione e sincronizza
    if (navigator.onLine) {
      syncFailedAppointments();
    }
    
    // Configurare listener per lo stato online/offline
    const handleOnline = () => {
      console.log('Connessione di rete ristabilita, sincronizzazione in corso...');
      syncFailedAppointments();
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [fullName, setFullName] = useState('');
  const [instagram, setInstagram] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [serviceType, setServiceType] = useState<Appointment['serviceType']>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);
  const [isBookingInProgress, setIsBookingInProgress] = useState(false);

  // Modifico la funzione per gestire la navigazione tra le settimane
  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    
    if (direction === 'next') {
      // Trova la prossima settimana disponibile
      const nextAvailableWeek = findNextAvailableWeek(newDate, true);
      
      // Limitare la navigazione a 60 giorni nel futuro
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 60);
      
      if (nextAvailableWeek <= maxDate) {
        setCurrentWeekStart(nextAvailableWeek);
      }
    } else {
      // Trova la settimana precedente disponibile
      const prevAvailableWeek = findNextAvailableWeek(newDate, false);
      
      // Usa la settimana precedente trovata
      setCurrentWeekStart(prevAvailableWeek);
    }
  };

  const bookAppointment = async () => {
    if (isBookingInProgress) return;
    
    setIsBookingInProgress(true);
    
    if (selectedAppointment && fullName && phoneNumber && serviceType && instagram) {
      const nameParts = fullName.trim().split(' ');
      let firstName = '';
      let lastName = '';
      
      if (nameParts.length === 1) {
        firstName = nameParts[0];
      } else if (nameParts.length > 1) {
        firstName = nameParts[0];
        lastName = nameParts.slice(1).join(' ');
      }
      
      const updatedAppointment = {
        date: selectedAppointment.date,
        day: selectedAppointment.day,
        time: selectedAppointment.time,
        clientName: firstName,
        clientSurname: lastName,
        clientEmail: email,
        phoneNumber,
        instagram: instagram || null,
        serviceType
      };

      // Funzione di salvataggio con retry
      const saveWithRetry = async (retryCount = 0, maxRetries = 3) => {
        try {
          const appointmentsRef = collection(db, 'appointments');
          const docRef = await addDoc(appointmentsRef, updatedAppointment);
          
          const appointmentWithId = {
            ...updatedAppointment,
            id: docRef.id
          };

          setAppointments(appointments.map(apt => 
            apt.date === selectedAppointment.date && apt.time === selectedAppointment.time
              ? appointmentWithId
              : apt
          ));
          
          // Creazione del link per Google Calendar
          const appointmentDate = new Date(selectedAppointment.date.split('/').reverse().join('-') + 'T' + selectedAppointment.time);
          const endDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000); // Aggiungi 1 ora
          
          const start = appointmentDate.toISOString().replace(/-|:|\.\d+/g, '');
          const end = endDate.toISOString().replace(/-|:|\.\d+/g, '');
          
          // Formatta il titolo e descrizione
          const serviceTypeText = {
            'ricostruzione': 'Ricostruzione unghie',
            'semipermanente': 'Semipermanente',
            'refill': 'Refill',
            'copertura': 'Copertura in gel',
            'smontaggio': 'Smontaggio'
          };
          
          const title = `Appuntamento JC Nails - ${updatedAppointment.serviceType ? (serviceTypeText[updatedAppointment.serviceType as keyof typeof serviceTypeText] || updatedAppointment.serviceType) : 'Servizio'}`;
          const location = "Via Ferruccio Pelli 14, 6° piano, citofono 'cito', Lugano";
          const description = `Appuntamento per ${updatedAppointment.serviceType ? (serviceTypeText[updatedAppointment.serviceType as keyof typeof serviceTypeText] || updatedAppointment.serviceType) : 'servizio'} presso JC Nails Lugano.\n\nPer domande: 0766070544 o Instagram @jcnailslugano`;
          
          const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}&sf=true&output=xml`;
          
          const emailData = {
            clientName: firstName + (lastName ? ' ' + lastName : ''),
            clientEmail: email,
            phoneNumber,
            instagram: instagram || 'Non specificato',
            date: selectedAppointment.date,
            day: selectedAppointment.day,
            time: selectedAppointment.time,
            serviceType: serviceType,
            calendarUrl: calendarUrl // Aggiungiamo l'URL del calendario ai dati dell'email
          };
          
          // Chiamata all'API per inviare le email
          try {
            const response = await fetch('/api/send-confirmation-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(emailData),
            });
            
            if (!response.ok) {
              console.warn('Errore nell\'invio delle email di conferma ma la prenotazione è stata registrata');
            } else {
              console.log('Email di conferma inviate con successo');
            }
          } catch (emailError) {
            console.warn('Errore nell\'invio delle email di conferma ma la prenotazione è stata registrata:', emailError);
          }
          
          setConfirmedAppointment(appointmentWithId);
          setSelectedAppointment(null);
          setShowSuccess(true);
          
          // Salvataggio locale in sessionStorage come backup
          try {
            const savedAppointments = JSON.parse(sessionStorage.getItem('savedAppointments') || '[]');
            savedAppointments.push(appointmentWithId);
            sessionStorage.setItem('savedAppointments', JSON.stringify(savedAppointments));
          } catch (storageError) {
            console.warn('Impossibile salvare in sessionStorage:', storageError);
          }
          
          return true;
        } catch (error) {
          console.error(`Tentativo ${retryCount + 1}/${maxRetries} fallito:`, error);
          
          if (retryCount < maxRetries) {
            // Attendi prima di riprovare (backoff esponenziale)
            const delay = Math.pow(2, retryCount) * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
            return saveWithRetry(retryCount + 1, maxRetries);
          } else {
            // Tutti i tentativi falliti, salviamo in localStorage come fallback
            try {
              const failedAppointments = JSON.parse(localStorage.getItem('failedAppointments') || '[]');
              failedAppointments.push({
                ...updatedAppointment,
                timestamp: new Date().toISOString()
              });
              localStorage.setItem('failedAppointments', JSON.stringify(failedAppointments));
              
              // Mostra comunque il messaggio di successo all'utente
              setConfirmedAppointment(updatedAppointment as Appointment);
              setSelectedAppointment(null);
              setShowSuccess(true);
            } catch (localError) {
              alert('Si è verificato un errore durante il salvataggio dell\'appuntamento. Per favore contattami al numero 0766070544 o via Instagram @jcnailslugano.');
            }
            return false;
          }
        } finally {
          setIsBookingInProgress(false);
        }
      };
      
      // Avvia il processo di salvataggio con retry
      await saveWithRetry();
    }
    
    setIsBookingInProgress(false);
  };

  const deleteAppointment = async (appointmentToDelete: Appointment) => {
    try {
      if ('id' in appointmentToDelete && appointmentToDelete.id) {
        const appointmentRef = doc(db, 'appointments', appointmentToDelete.id);
        await deleteDoc(appointmentRef);
        
        // Invia email di notifica per la cancellazione
        if (appointmentToDelete.clientEmail) {
          try {
            // Dati per l'email
            const emailData = {
              type: 'cancel',
              clientName: `${appointmentToDelete.clientName} ${appointmentToDelete.clientSurname}`,
              clientEmail: appointmentToDelete.clientEmail,
              phoneNumber: appointmentToDelete.phoneNumber,
              instagram: appointmentToDelete.instagram,
              date: appointmentToDelete.date,
              day: appointmentToDelete.day,
              time: appointmentToDelete.time,
              serviceType: appointmentToDelete.serviceType
            };
            
            // Chiamata all'API per inviare le email
            await fetch('/api/send-confirmation-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(emailData),
            });
            
            console.log('Email di cancellazione inviate con successo');
          } catch (emailError) {
            console.error('Errore nell\'invio delle email di cancellazione:', emailError);
          }
        }
      }

      // Aggiorna lo stato locale
      setAppointments(appointments.map(apt => 
        apt.date === appointmentToDelete.date && apt.time === appointmentToDelete.time
          ? { ...apt, clientName: null, clientSurname: null, clientEmail: null, phoneNumber: null, instagram: null, serviceType: null }
          : apt
      ));
    } catch (error) {
      console.error('Errore nell\'eliminazione dell\'appuntamento:', error);
    }
  };

  const updateAppointment = async (oldAppointment: Appointment, newAppointment: Appointment) => {
    try {
      if ('id' in oldAppointment && oldAppointment.id) {
        const appointmentRef = doc(db, 'appointments', oldAppointment.id);
        // Rimuoviamo l'id prima di inviare l'aggiornamento
        const { id, ...appointmentWithoutId } = newAppointment;
        await updateDoc(appointmentRef, appointmentWithoutId);

        // Invia email di notifica per la modifica
        if (oldAppointment.clientEmail) {
          try {
            // Dati per l'email
            const emailData = {
              type: 'update',
              clientName: `${newAppointment.clientName} ${newAppointment.clientSurname}`,
              clientEmail: newAppointment.clientEmail,
              phoneNumber: newAppointment.phoneNumber,
              instagram: newAppointment.instagram,
              // Dati nuovi
              date: newAppointment.date,
              day: newAppointment.day,
              time: newAppointment.time,
              serviceType: newAppointment.serviceType,
              // Dati precedenti
              oldDate: oldAppointment.date,
              oldDay: oldAppointment.day,
              oldTime: oldAppointment.time,
              oldServiceType: oldAppointment.serviceType
            };
            
            // Chiamata all'API per inviare le email
            await fetch('/api/send-confirmation-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(emailData),
            });
            
            console.log('Email di modifica inviate con successo');
          } catch (emailError) {
            console.error('Errore nell\'invio delle email di modifica:', emailError);
          }
        }
      }

      setAppointments(appointments.map(apt => 
        apt.date === oldAppointment.date && apt.time === oldAppointment.time
          ? newAppointment
          : apt
      ));
    } catch (error) {
      console.error('Errore nell\'aggiornamento dell\'appuntamento:', error);
    }
  };

  const generateCalendarUrl = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.date.split('/').reverse().join('-') + 'T' + appointment.time);
    const endDate = new Date(appointmentDate.getTime() + 60 * 60 * 1000); // 1 ora
    
    const start = appointmentDate.toISOString().replace(/-|:|\.\d+/g, '');
    const end = endDate.toISOString().replace(/-|:|\.\d+/g, '');
    
    const serviceTypeText = {
      'ricostruzione': 'Ricostruzione unghie',
      'semipermanente': 'Semipermanente',
      'refill': 'Refill',
      'copertura': 'Copertura in gel',
      'smontaggio': 'Smontaggio'
    };
    
    const title = `Appuntamento JC Nails - ${appointment.serviceType ? (serviceTypeText[appointment.serviceType as keyof typeof serviceTypeText] || appointment.serviceType) : 'Servizio'}`;
    const location = "Via Ferruccio Pelli 14, 6° piano, citofono 'cito', Lugano";
    const description = `Appuntamento per ${appointment.serviceType ? (serviceTypeText[appointment.serviceType as keyof typeof serviceTypeText] || appointment.serviceType) : 'servizio'} presso JC Nails Lugano.\n\nPer domande: 0766070544 o Instagram @jcnailslugano`;
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(description)}&location=${encodeURIComponent(location)}&sf=true&output=xml`;
  };

  console.log('Appuntamenti totali:', appointments.length);
  console.log('Appuntamenti prenotati:', appointments.filter(apt => apt.clientName !== null).length);

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
              "streetAddress": "Via Ferruccio Pelli 14, 6° piano, citofono 'cito'",
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
          <div className="text-center relative flex flex-col items-center gap-4">
            <button
              onClick={() => setIsAdminView(true)}
              className="absolute right-2 top-2 md:right-4 md:top-4 p-2 rounded-full hover:bg-pink-200 transition-colors"
              title="Area Admin"
            >
              <Shield className="w-5 h-5 md:w-6 md:h-6 text-pink-800" />
            </button>
            
            <div className="w-80 h-60">
              <img 
                src="/logo.png" 
                alt="JC Nails Lugano Logo" 
                className="w-full h-full object-cover"
              />
            </div>
            
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
                    {[...Array(8)].map((_, index) => {
                      const weekStart = new Date(getInitialWeekStart().getTime());
                      weekStart.setDate(weekStart.getDate() + (index * 7));
                      
                      // Limitare a 60 giorni
                      const maxDate = new Date();
                      maxDate.setDate(maxDate.getDate() + 60);
                      
                      if (weekStart > maxDate) {
                        return null;
                      }
                      
                      // Verifica se questa settimana ha appuntamenti disponibili
                      const hasAppointments = generateAppointments(weekStart).length > 0;
                      
                      // Mostra solo settimane con appuntamenti disponibili
                      if (!hasAppointments) {
                        return null;
                      }
                      
                      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000);
                      
                      return (
                        <button
                          key={index}
                          onClick={() => {
                            setCurrentWeekStart(weekStart);
                            setIsWeekSelectorOpen(false);
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-pink-50 transition-colors first:rounded-t-lg last:rounded-b-lg"
                        >
                          {weekStart.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })} - {
                            weekEnd.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          }
                        </button>
                      );
                    }).filter(Boolean)}
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
                  className="p-4 rounded-lg border bg-white border-pink-200 hover:border-pink-400 cursor-pointer h-[120px] flex flex-col justify-between"
                  onClick={() => setSelectedAppointment(apt)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-pink-800">
                        {apt.day} - {apt.date}
                      </span>
                    </div>
                    <Clock className="w-5 h-5 text-pink-600" />
                  </div>
                  <div className="text-2xl font-bold text-pink-700">
                    {apt.time}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Policy Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-semibold text-pink-800 mb-6 flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Rules
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg border border-pink-100 hover:bg-pink-50 transition-colors">
              <div className="text-pink-600">
                <CreditCard className="w-6 h-6" />
              </div>
              <p className="text-gray-700">
                Metodo di pagamento accettato: Contanti o Twint; <br /> No carta di credito
              </p>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg border border-pink-100 hover:bg-pink-50 transition-colors">
              <div className="text-pink-600">
                <Clock className="w-6 h-6" />
              </div>
              <p className="text-gray-700">
                Si prega di disdire con 24 ore di anticipo
              </p>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg border border-pink-100 hover:bg-pink-50 transition-colors">
              <div className="text-pink-600">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-gray-700">
                Il prezzo del refill varia in base alla lunghezza
              </p>
            </div>
            <div className="flex items-center gap-4 p-4 rounded-lg border border-pink-100 hover:bg-pink-50 transition-colors">
              <div className="text-pink-600">
                <UserX className="w-6 h-6" />
              </div>
              <p className="text-gray-700">
                No Accompagnatori
              </p>
            </div>
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
      </footer>

      {/* Success Modal */}
      {showSuccess && confirmedAppointment && (
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
                <div className="text-green-600 text-lg">
                  <p>Ti aspettiamo il {confirmedAppointment.day.toLowerCase()} {confirmedAppointment.date} alle {confirmedAppointment.time} in Via F.Pelli 14, 6° piano, citofono 'cito'</p>
                  <p className="mt-2 text-sm">Ti avviseremo il giorno prima su Instagram</p>
                </div>
                
                <p className="text-gray-600">
                  Se hai ulteriori domande o chiarimenti contattami:
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
                  setConfirmedAppointment(null);
                  setFullName('');
                  setInstagram('');
                  setPhoneNumber('');
                  setEmail('');
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
              {selectedAppointment.day} {selectedAppointment.date} alle {selectedAppointment.time}
            </p>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Nome e Cognome"
                className="w-full p-2 border border-pink-200 rounded-lg"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <input
                type="email"
                placeholder="Email (facoltativo)"
                className="w-full p-2 border border-pink-200 rounded-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative">
                <span className="absolute left-2 top-2 text-gray-500">@</span>
                <input
                  type="text"
                  placeholder="Instagram (obbligatorio)"
                  className="w-full p-2 pl-7 border border-pink-200 rounded-lg"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  required
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
                disabled={!fullName || !phoneNumber || !serviceType || !instagram || isBookingInProgress}
              >
                {isBookingInProgress ? 'Prenotazione in corso...' : 'Conferma'}
              </button>
              <button
                className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                onClick={() => {
                  setSelectedAppointment(null);
                  setFullName('');
                  setInstagram('');
                  setPhoneNumber('');
                  setEmail('');
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