exports.handler = async function(event, context) {
  console.log("Funzione send-confirmation-email invocata");
  
  try {
    const body = JSON.parse(event.body);
    console.log("Dati ricevuti:", JSON.stringify(body));
    
    const { type, appointmentData, previousData } = body;
    
    switch (type) {
      case 'new':
        console.log("Invio email per nuovo appuntamento");
        await inviaEmailConfermaAppuntamento(appointmentData);
        break;
      case 'update':
        console.log("Invio email per modifica appuntamento");
        await inviaEmailModificaAppuntamento(appointmentData, previousData);
        break;
      case 'cancel':
        console.log("Invio email per cancellazione appuntamento");
        await inviaEmailCancellazioneAppuntamento(appointmentData);
        break;
      default:
        console.error("Tipo di notifica non valido:", type);
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Tipo di notifica non valido" })
        };
    }
    
    console.log("Email inviate con successo");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Email inviate con successo" })
    };
  } catch (error) {
    console.error("Errore durante l'invio dell'email:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: `Errore: ${error.message}` })
    };
  }
};

// Aggiungi log ai metodi di invio email
const inviaEmailModificaAppuntamento = async (nuoviDati, vecchiDati) => {
  try {
    console.log("Preparazione email di modifica con dati:", {
      nuovi: nuoviDati,
      vecchi: vecchiDati
    });
    // ... existing code ...
    console.log("Email di modifica inviate con successo");
  } catch (error) {
    console.error("Errore nell'invio delle email di modifica:", error);
    throw error;
  }
};

// ... similarly update other email functions with detailed logging ...

// ... existing code ... 