import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { date, time, service } = req.query;

  if (!date || !time || !service) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const [day, month, year] = (date as string).split('/');
  const [hours, minutes] = (time as string).split(':');
  
  // Creo la data di inizio
  const startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
  // Aggiungo un'ora per la fine dell'appuntamento
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
  
  const formatDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  // Creo un ID unico per l'evento
  const eventId = `jcnails-${Date.now()}@jcnails.ch`;

  const event = {
    start: formatDate(startDate),
    end: formatDate(endDate),
    title: `Appuntamento JC Nails - ${service}`,
    description: `Appuntamento per ${service} da JC Nails Lugano\nInstagram: @jcnailslugano\nTel: 0766070544\n\nVia Ferruccio Pelli 14, 6° piano\n6900 Lugano`,
    location: 'Via Ferruccio Pelli 14, 6900 Lugano',
  };

  const icsContent = `BEGIN:VCALENDAR
PRODID:-//JC Nails//Appointment Calendar//IT
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${eventId}
DTSTAMP:${formatDate(new Date())}
DTSTART:${event.start}
DTEND:${event.end}
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, '\\n')}
LOCATION:${event.location}
STATUS:CONFIRMED
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Reminder
END:VALARM
END:VEVENT
END:VCALENDAR`;

  // Headers specifici per iOS
  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', 'attachment; filename=appuntamento-jc-nails.ics');
  res.setHeader('Cache-Control', 'no-cache');
  res.status(200).send(icsContent);
} 