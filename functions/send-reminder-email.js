const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
  const { email, name, date, time, service } = JSON.parse(event.body);
  
  // Configurazione del trasportatore email
  let transporter = nodemailer.createTransport({
    // ... configurazione esistente ...
  });
  
  try {
    await transporter.sendMail({
      from: '"Nome Attività" <email@tuodominio.com>',
      to: email,
      subject: "Promemoria: Appuntamento Domani",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px;">
          <h2>Promemoria Appuntamento</h2>
          <p>Gentile ${name},</p>
          <p>Ti ricordiamo che hai un appuntamento domani:</p>
          <p><strong>Data:</strong> ${date}<br>
          <strong>Ora:</strong> ${time}<br>
          <strong>Servizio:</strong> ${service}</p>
          <p>Ti aspettiamo!</p>
        </div>
      `
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Promemoria inviato con successo" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Errore nell'invio del promemoria", error: error.message })
    };
  }
}; 