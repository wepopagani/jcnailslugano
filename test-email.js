import { verificaConnessione, testEmailAdmin } from './emailService.js';

const eseguiTest = async () => {
  try {
    // Prima verifica la connessione
    const connessioneOk = await verificaConnessione();
    
    if (!connessioneOk) {
      console.error('Impossibile connettersi al server email. Verifica le credenziali.');
      return;
    }
    
    // Invia una email di test all'admin
    console.log('Invio email di test in corso...');
    const risultato = await testEmailAdmin();
    
    if (risultato.success) {
      console.log('Email di test inviata con successo!');
      console.log('ID Messaggio:', risultato.messageId);
    } else {
      console.error('Errore nell\'invio dell\'email di test:', risultato.error);
    }
  } catch (error) {
    console.error('Errore imprevisto durante il test:', error);
  }
};

// Esegui il test
eseguiTest(); 