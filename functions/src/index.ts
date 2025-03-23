import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as sgMail from '@sendgrid/mail';

admin.initializeApp();

// Sostituisci con la tua API key di SendGrid
const SENDGRID_API_KEY = functions.config().sendgrid.key;
sgMail.setApiKey(SENDGRID_API_KEY);

const getEmailTemplate = (appointment: any) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <div style="background-color: #d53f8c; padding: 20px; text-align: center;">
      <h1 style="color: white; margin: 0;">JC Nails Lugano</h1>
    </div>
    <div style="padding: 20px; background-color: #fff5f7;">
      <h2 style="color: #d53f8c;">Nuovo Appuntamento</h2>
      <div style="background-color: white; padding: 15px; border-radius: 8px;">
        <p><strong>📅 Data:</strong> ${appointment.date}</p>
        <p><strong>⏰ Ora:</strong> ${appointment.time}</p>
        <p><strong>👤 Cliente:</strong> ${appointment.clientName} ${appointment.clientSurname}</p>
        <p><strong>📱 Telefono:</strong> ${appointment.phoneNumber || 'Non specificato'}</p>
        <p><strong>📸 Instagram:</strong> ${appointment.instagram ? '@' + appointment.instagram : 'Non specificato'}</p>
        <p><strong>💅 Servizio:</strong> ${appointment.serviceType}</p>
      </div>
    </div>
  </div>
`;

export const sendEmailNotification = functions.firestore
  .onDocumentCreated('appointments/{appointmentId}', async (event) => {
    const appointment = event.data?.data();
    
    if (!appointment) {
      console.log('Nessun dato dell\'appuntamento trovato');
      return null;
    }

    const emailHtml = getEmailTemplate(appointment);

    const msg = {
      to: 'jcnailslugano@gmail.com',
      from: 'noreply@jcnails.ch',
      subject: `Nuovo Appuntamento: ${appointment.date} - ${appointment.time}`,
      html: emailHtml,
    };

    try {
      await sgMail.send(msg);
      await admin.firestore()
        .collection('notifications')
        .add({
          type: 'email',
          status: 'success',
          appointmentId: event.params.appointmentId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      console.log('Email inviata con successo');
      return null;
    } catch (error) {
      await admin.firestore()
        .collection('notifications')
        .add({
          type: 'email',
          status: 'error',
          error: error.message,
          appointmentId: event.params.appointmentId,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      console.error('Errore nell\'invio dell\'email:', error);
      throw new Error('Errore nell\'invio dell\'email');
    }
}); 