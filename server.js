import express from 'express';
import cors from 'cors';
import { inviaEmailAppuntamento } from './emailService.js';

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/send-confirmation-email', async (req, res) => {
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
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server avviato sulla porta ${PORT}`);
}); 