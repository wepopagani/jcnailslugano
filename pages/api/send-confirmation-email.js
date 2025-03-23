import { inviaEmailAppuntamento } from '../../emailService.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Metodo non consentito' });
  }

  try {
    const {
      clientName,
      clientEmail,
      phoneNumber,
      instagram,
      date,
      day,
      time,
      serviceType
    } = req.body;

    // Conversione del serviceType in una stringa leggibile
    const serviceMap = {
      'ricostruzione': 'Ricostruzione unghie',
      'semipermanente': 'Semipermanente',
      'refill': 'Refill',
      'copertura': 'Copertura in gel',
      'smontaggio': 'Smontaggio'
    };

    const appointment = {
      nomeCliente: clientName,
      emailCliente: clientEmail,
      telefono: phoneNumber,
      instagram,
      data: date,
      giorno: day,
      ora: time,
      servizio: serviceMap[serviceType] || serviceType
    };

    const result = await inviaEmailAppuntamento(appointment);

    if (result.success) {
      res.status(200).json({ message: 'Email inviate con successo' });
    } else {
      console.error('Errore nell\'invio delle email:', result.error);
      res.status(500).json({ message: 'Errore nell\'invio delle email', error: result.error });
    }
  } catch (error) {
    console.error('Errore nel server:', error);
    res.status(500).json({ message: 'Errore del server', error: error.message });
  }
} 