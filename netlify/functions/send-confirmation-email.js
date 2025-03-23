import nodemailer from 'nodemailer';

// Configurazione del transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Funzione per inviare email di conferma appuntamento
const inviaEmailAppuntamento = async (appuntamento) => {
  const transporter = createTransporter();
  
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
            
            <p style="color: #666; line-height: 1.5;">Ti aspettiamo al nostro salone. In caso di imprevisti o se desideri modificare/cancellare l'appuntamento, ti preghiamo di contattarci con almeno 24 ore di anticipo.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #d4649a; margin: 5px 0; font-weight: bold;">Ti aspettiamo!</p>
              <p style="color: #666; margin: 5px 0;">Via Ferruccio Pelli 14, 6° piano, Lugano</p>
              <p style="color: #666; margin: 5px 0;">Tel: 0766070544</p>
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
};

// Funzione per inviare email di modifica appuntamento
const inviaEmailModificaAppuntamento = async (appuntamento) => {
  const transporter = createTransporter();
  
  try {
    // Email per il cliente - modifica
    const emailCliente = {
      from: {
        name: 'JC Nails', 
        address: process.env.EMAIL_USER
      },
      to: appuntamento.emailCliente,
      subject: 'Appuntamento modificato - JC Nails',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f5d6e6; border-radius: 8px; background-color: #fff9fc;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #d4649a; font-size: 24px; margin: 0;">JC Nails</h1>
            <p style="color: #a76b8f; margin: 5px 0 20px;">Beauty & Nail Art</p>
          </div>
          
          <div style="background-color: white; border-radius: 8px; padding: 20px; border: 1px solid #f8e1ed; margin-bottom: 20px;">
            <h2 style="color: #d4649a; font-size: 18px; margin-top: 0; text-align: center;">Il tuo appuntamento è stato modificato</h2>
            
            <p style="color: #666; line-height: 1.5;">Gentile ${appuntamento.nomeCliente},<br>
            ti informiamo che il tuo appuntamento è stato modificato.</p>
            
            <div style="background-color: #fef4f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #d4649a; margin-top: 0;">Appuntamento precedente:</h3>
              <table style="width: 100%;">
                <tr>
                  <td style="padding: 8px 5px; color: #a76b8f; width: 30%;"><strong>Data:</strong></td>
                  <td style="padding: 8px 5px; color: #666;">${appuntamento.vecchiaData}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 5px; color: #a76b8f;"><strong>Ora:</strong></td>
                  <td style="padding: 8px 5px; color: #666;">${appuntamento.vecchiaOra}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 5px; color: #a76b8f;"><strong>Servizio:</strong></td>
                  <td style="padding: 8px 5px; color: #666;">${appuntamento.vecchioServizio || 'Non specificato'}</td>
                </tr>
              </table>
              
              <h3 style="color: #d4649a; margin-top: 15px;">Nuovo appuntamento:</h3>
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
            
            <p style="color: #666; line-height: 1.5;">Ti aspettiamo al nostro salone. In caso di imprevisti o se desideri modificare/cancellare l'appuntamento, ti preghiamo di contattarci con almeno 24 ore di anticipo.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #d4649a; margin: 5px 0; font-weight: bold;">Ti aspettiamo!</p>
              <p style="color: #666; margin: 5px 0;">Via Ferruccio Pelli 14, 6° piano, Lugano</p>
              <p style="color: #666; margin: 5px 0;">Tel: 0766070544</p>
            </div>
          </div>
          
          <p style="color: #888; font-size: 12px; text-align: center; margin-top: 10px;">
            Questo messaggio è stato inviato automaticamente. Si prega di non rispondere.
          </p>
        </div>
      `
    };

    // Email per l'amministratore - modifica
    const emailAdmin = {
      from: {
        name: 'Sistema Appuntamenti JC Nails', 
        address: process.env.EMAIL_USER
      },
      to: 'jaclin2704@gmail.com',
      subject: 'Appuntamento modificato',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f5d6e6; border-radius: 8px; background-color: #fff9fc;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #d4649a; font-size: 24px; margin: 0;">JC Nails</h1>
            <p style="color: #a76b8f; margin: 5px 0 0;">Sistema di Prenotazione</p>
          </div>
          
          <div style="background-color: white; border-radius: 8px; padding: 15px; border: 1px solid #f8e1ed; margin-bottom: 20px;">
            <h2 style="color: #d4649a; font-size: 18px; margin-top: 0;">Appuntamento Modificato</h2>
            
            <div style="margin-bottom: 15px;">
              <h3 style="color: #a76b8f; margin-top: 0;">Dettagli Cliente:</h3>
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
              </table>
            </div>
            
            <div style="margin-bottom: 15px;">
              <h3 style="color: #a76b8f; margin-top: 0;">Appuntamento precedente:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #a76b8f;"><strong>Data:</strong></td>
                  <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #666;">${appuntamento.vecchiaData}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #a76b8f;"><strong>Ora:</strong></td>
                  <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #666;">${appuntamento.vecchiaOra}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #a76b8f;"><strong>Servizio:</strong></td>
                  <td style="padding: 8px 5px; border-bottom: 1px solid #f8e1ed; color: #666;">${appuntamento.vecchioServizio || 'Non specificato'}</td>
                </tr>
              </table>
            </div>
            
            <div>
              <h3 style="color: #a76b8f; margin-top: 0;">Nuovo appuntamento:</h3>
              <table style="width: 100%; border-collapse: collapse;">
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
              </table>
            </div>
          </div>
        </div>
      `
    };

    // Invia entrambe le email
    const infoCliente = await transporter.sendMail(emailCliente);
    const infoAdmin = await transporter.sendMail(emailAdmin);
    
    console.log('Email di modifica inviata al cliente:', infoCliente.messageId);
    console.log('Email di modifica inviata all\'admin:', infoAdmin.messageId);
    
    return { success: true, clienteId: infoCliente.messageId, adminId: infoAdmin.messageId };
  } catch (error) {
    console.error('Errore nell\'invio delle email di modifica:', error);
    return { success: false, error: error.message };
  }
};

// Funzione per inviare email di cancellazione appuntamento
const inviaEmailCancellazioneAppuntamento = async (appuntamento) => {
  const transporter = createTransporter();
  
  try {
    // Email per il cliente - cancellazione
    const emailCliente = {
      from: {
        name: 'JC Nails', 
        address: process.env.EMAIL_USER
      },
      to: appuntamento.emailCliente,
      subject: 'Appuntamento cancellato - JC Nails',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f5d6e6; border-radius: 8px; background-color: #fff9fc;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #d4649a; font-size: 24px; margin: 0;">JC Nails</h1>
            <p style="color: #a76b8f; margin: 5px 0 20px;">Beauty & Nail Art</p>
          </div>
          
          <div style="background-color: white; border-radius: 8px; padding: 20px; border: 1px solid #f8e1ed; margin-bottom: 20px;">
            <h2 style="color: #d4649a; font-size: 18px; margin-top: 0; text-align: center;">Il tuo appuntamento è stato cancellato</h2>
            
            <p style="color: #666; line-height: 1.5;">Gentile ${appuntamento.nomeCliente},<br>
            ti informiamo che il tuo appuntamento è stato cancellato come richiesto.</p>
            
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
            
            <p style="color: #666; line-height: 1.5;">Se desideri prenotare un nuovo appuntamento, visita il nostro sito web o contattaci direttamente.</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #d4649a; margin: 5px 0; font-weight: bold;">Grazie per la comprensione</p>
              <p style="color: #666; margin: 5px 0;">Via Ferruccio Pelli 14, 6° piano, Lugano</p>
              <p style="color: #666; margin: 5px 0;">Tel: 0766070544</p>
            </div>
          </div>
          
          <p style="color: #888; font-size: 12px; text-align: center; margin-top: 10px;">
            Questo messaggio è stato inviato automaticamente. Si prega di non rispondere.
          </p>
        </div>
      `
    };

    // Email per l'amministratore - cancellazione
    const emailAdmin = {
      from: {
        name: 'Sistema Appuntamenti JC Nails', 
        address: process.env.EMAIL_USER
      },
      to: 'jaclin2704@gmail.com',
      subject: 'Appuntamento cancellato',
      html: `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #f5d6e6; border-radius: 8px; background-color: #fff9fc;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #d4649a; font-size: 24px; margin: 0;">JC Nails</h1>
            <p style="color: #a76b8f; margin: 5px 0 0;">Sistema di Prenotazione</p>
          </div>
          
          <div style="background-color: white; border-radius: 8px; padding: 15px; border: 1px solid #f8e1ed; margin-bottom: 20px;">
            <h2 style="color: #d4649a; font-size: 18px; margin-top: 0;">Appuntamento Cancellato</h2>
            
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
            </table>
          </div>
        </div>
      `
    };

    // Invia entrambe le email
    const infoCliente = await transporter.sendMail(emailCliente);
    const infoAdmin = await transporter.sendMail(emailAdmin);
    
    console.log('Email di cancellazione inviata al cliente:', infoCliente.messageId);
    console.log('Email di cancellazione inviata all\'admin:', infoAdmin.messageId);
    
    return { success: true, clienteId: infoCliente.messageId, adminId: infoAdmin.messageId };
  } catch (error) {
    console.error('Errore nell\'invio delle email di cancellazione:', error);
    return { success: false, error: error.message };
  }
};

export const handler = async (event, context) => {
  // Verifica che la richiesta sia di tipo POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: 'Metodo non consentito' })
    };
  }

  try {
    // Estrai i dati dalla richiesta
    const data = JSON.parse(event.body);
    const { 
      type = 'new', // 'new', 'update', 'cancel'
      clientName,
      clientEmail,
      phoneNumber,
      instagram,
      date,
      oldDate, // per modifiche
      day,
      oldDay, // per modifiche 
      time,
      oldTime, // per modifiche
      serviceType,
      oldServiceType // per modifiche
    } = data;

    // Conversione del serviceType
    const serviceMap = {
      'ricostruzione': 'Ricostruzione unghie',
      'semipermanente': 'Semipermanente',
      'refill': 'Refill',
      'copertura': 'Copertura in gel',
      'smontaggio': 'Smontaggio'
    };

    // Configurazione di base dell'appuntamento
    const appointment = {
      nomeCliente: clientName,
      emailCliente: clientEmail,
      telefono: phoneNumber,
      instagram: instagram || 'Non specificato',
      data: date,
      giorno: day,
      ora: time,
      servizio: serviceMap[serviceType] || serviceType,
      // Aggiungi informazioni precedenti se è un aggiornamento
      vecchiaData: oldDate,
      vecchioGiorno: oldDay, 
      vecchiaOra: oldTime,
      vecchioServizio: oldServiceType ? (serviceMap[oldServiceType] || oldServiceType) : null
    };

    let result;
    
    switch(type) {
      case 'update':
        result = await inviaEmailModificaAppuntamento(appointment);
        break;
      case 'cancel':
        result = await inviaEmailCancellazioneAppuntamento(appointment);
        break;
      case 'new':
      default:
        result = await inviaEmailAppuntamento(appointment);
    }

    if (result.success) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: 'Email inviate con successo' })
      };
    } else {
      console.error('Errore nell\'invio delle email:', result.error);
      return {
        statusCode: 500,
        body: JSON.stringify({ message: 'Errore nell\'invio delle email', error: result.error })
      };
    }
  } catch (error) {
    console.error('Errore nel server:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Errore del server', error: error.message })
    };
  }
}; 