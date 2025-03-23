import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import nodemailer from 'nodemailer';

// Per funzionare correttamente con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configura dotenv specificando il path
dotenv.config({ path: `${__dirname}/.env` });

// Verifica che le variabili d'ambiente siano caricate
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Disponibile' : 'Non disponibile');

// Configura il transporter SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', 
  port: 587,
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Funzione per verificare la connessione
const verificaConnessione = async () => {
  try {
    await transporter.verify();
    console.log('Server email pronto per inviare messaggi');
    return true;
  } catch (error) {
    console.error('Errore nella connessione al server email:', error);
    return false;
  }
};

// Funzione per testare l'invio di email solo all'amministratore
const testEmailAdmin = async () => {
  try {
    const testAppuntamento = {
      nomeCliente: "Maria Rossi",
      emailCliente: "test@example.com",
      telefono: "123456789",
      data: new Date().toLocaleDateString('it-IT'),
      ora: "14:30",
      servizio: "Manicure Semipermanente",
      note: "Prima volta"
    };

    const emailAdmin = {
      from: {
        name: 'JC Nails', 
        address: process.env.EMAIL_USER
      },
      to: 'jaclin2704@gmail.com',
      subject: 'Nuovo appuntamento prenotato',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f5d6e6; border-radius: 8px; background-color: #fff9fc;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #d4649a; font-size: 24px; margin: 0;">JC Nails</h1>
          </div>
          
          <div style="background-color: white; border-radius: 8px; padding: 15px; border: 1px solid #f8e1ed; margin-bottom: 20px;">
            <h2 style="color: #d4649a; font-size: 18px; margin-top: 0;">Dettagli Nuovo Appuntamento</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #a76b8f; width: 40%;"><strong>Cliente:</strong></td>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #666;">${testAppuntamento.nomeCliente}</td>
              </tr>
              <tr>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #a76b8f;"><strong>Email:</strong></td>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #666;">${testAppuntamento.emailCliente}</td>
              </tr>
              <tr>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #a76b8f;"><strong>Telefono:</strong></td>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #666;">${testAppuntamento.telefono}</td>
              </tr>
              <tr>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #a76b8f;"><strong>Data:</strong></td>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #666;">${testAppuntamento.data}</td>
              </tr>
              <tr>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #a76b8f;"><strong>Ora:</strong></td>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #666;">${testAppuntamento.ora}</td>
              </tr>
              <tr>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #a76b8f;"><strong>Servizio:</strong></td>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #666;">${testAppuntamento.servizio}</td>
              </tr>
              <tr>
                <td style="padding: 8px 5px; color: #a76b8f;"><strong>Note:</strong></td>
                <td style="padding: 8px 5px; color: #666;">${testAppuntamento.note}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #888; font-size: 14px; text-align: center; margin-top: 25px;">
            Questo messaggio è stato inviato automaticamente dal sistema di prenotazione di JC Nails.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(emailAdmin);
    console.log('Email di test inviata all\'admin:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Errore nell\'invio dell\'email di test:', error);
    return { success: false, error: error.message };
  }
};

// Funzione per inviare email di conferma appuntamento
const inviaEmailAppuntamento = async (appuntamento) => {
  try {
    // Prepara l'email per il cliente
    const emailCliente = {
      from: {
        name: 'JC Nails', 
        address: process.env.EMAIL_USER
      },
      to: appuntamento.emailCliente,
      subject: 'Conferma Appuntamento - JC Nails',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f5d6e6; border-radius: 8px; background-color: #fff9fc;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #d4649a; font-size: 24px; margin: 0;">JC Nails</h1>
            <p style="color: #a76b8f; margin: 5px 0 20px;">Beauty & Nail Art</p>
          </div>
          
          <div style="background-color: white; border-radius: 8px; padding: 20px; border: 1px solid #f8e1ed; margin-bottom: 20px;">
            <h2 style="color: #d4649a; font-size: 18px; margin-top: 0; text-align: center;">Il tuo appuntamento è confermato!</h2>
            
            <p style="color: #666; line-height: 1.5;">Gentile ${appuntamento.nomeCliente},<br>
            grazie per aver prenotato un appuntamento presso JC Nails. Siamo lieti di confermarti che il tuo appuntamento è stato registrato con successo.</p>
            
            <div style="background-color: #fef4f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 5px; color: #a76b8f; width: 30%;"><strong>Data:</strong></td>
                  <td style="padding: 8px 5px; color: #666;">${appuntamento.data}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 5px; color: #a76b8f;"><strong>Ora:</strong></td>
                  <td style="padding: 8px 5px; color: #666;">${appuntamento.ora}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 5px; color: #a76b8f;"><strong>Servizio:</strong></td>
                  <td style="padding: 8px 5px; color: #666;">${appuntamento.servizio || 'Non specificato'}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #666; line-height: 1.5;">In caso di imprevisti o se desideri modificare/cancellare l'appuntamento, ti preghiamo di contattarci con almeno 24 ore di anticipo.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #d4649a; margin: 5px 0; font-weight: bold;">Ti aspettiamo!</p>
              <p style="color: #666; margin: 5px 0;">Via F. Pelli 14, 6900 Lugano</p>
              <p style="color: #666; margin: 5px 0;">Tel: 076 607 05 44</p>
            </div>
          </div>
          
          <p style="color: #888; font-size: 12px; text-align: center; margin-top: 10px;">
            Questo messaggio è stato inviato automaticamente. Si prega di non rispondere.
          </p>
        </div>
      `
    };

    // Prepara l'email per l'amministratore
    const emailAdmin = {
      from: {
        name: 'Sistema Appuntamenti JC Nails', 
        address: process.env.EMAIL_USER
      },
      to: 'jaclin2704@gmail.com',
      subject: 'Nuovo appuntamento prenotato',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f5d6e6; border-radius: 8px; background-color: #fff9fc;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #d4649a; font-size: 24px; margin: 0;">JC Nails</h1>
            <p style="color: #a76b8f; margin: 5px 0 0;">Sistema di Prenotazione</p>
          </div>
          
          <div style="background-color: white; border-radius: 8px; padding: 15px; border: 1px solid #f8e1ed; margin-bottom: 20px;">
            <h2 style="color: #d4649a; font-size: 18px; margin-top: 0;">Dettagli Nuovo Appuntamento</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #a76b8f; width: 40%;"><strong>Cliente:</strong></td>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #666;">${appuntamento.nomeCliente}</td>
              </tr>
              <tr>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #a76b8f;"><strong>Email:</strong></td>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #666;">${appuntamento.emailCliente}</td>
              </tr>
              <tr>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #a76b8f;"><strong>Telefono:</strong></td>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #666;">${appuntamento.telefono || 'Non specificato'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #a76b8f;"><strong>Data:</strong></td>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #666;">${appuntamento.data}</td>
              </tr>
              <tr>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #a76b8f;"><strong>Ora:</strong></td>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #666;">${appuntamento.ora}</td>
              </tr>
              <tr>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #a76b8f;"><strong>Servizio:</strong></td>
                <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #666;">${appuntamento.servizio || 'Non specificato'}</td>
              </tr>
              <tr>
                <td style="padding: 8px 5px; color: #a76b8f;"><strong>Note:</strong></td>
                <td style="padding: 8px 5px; color: #666;">${appuntamento.note || 'Nessuna'}</td>
              </tr>
            </table>
          </div>
          
          <p style="color: #888; font-size: 14px; text-align: center; margin-top: 25px;">
            Questo messaggio è stato inviato automaticamente dal sistema di prenotazione.
          </p>
        </div>
      `
    };

    try {
      // Invia entrambe le email
      const infoCliente = await transporter.sendMail(emailCliente);
      const infoAdmin = await transporter.sendMail(emailAdmin);
      
      console.log('Email inviata al cliente:', infoCliente.messageId);
      console.log('Email inviata all\'admin:', infoAdmin.messageId);
      
      return { success: true, clienteId: infoCliente.messageId, adminId: infoAdmin.messageId };
    } catch (error) {
      console.error('Errore nell\'invio delle email:', error);
      return { success: false, error: error.message };
    }
  } catch (error) {
    console.error('Errore generale:', error);
    return { success: false, error: error.message };
  }
};

export {
  verificaConnessione,
  inviaEmailAppuntamento,
  testEmailAdmin
};
