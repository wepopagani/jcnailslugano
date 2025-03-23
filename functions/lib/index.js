"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testSendGrid = exports.sendEmailNotification = void 0;
const functionsV1 = __importStar(require("firebase-functions/v1"));
const admin = __importStar(require("firebase-admin"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
admin.initializeApp();
// Sostituisci con la tua API key di SendGrid
const SENDGRID_API_KEY = functionsV1.config().sendgrid.key;
mail_1.default.setApiKey(SENDGRID_API_KEY);
const getEmailTemplate = (appointment) => `
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
// Utilizzo la versione v1 delle funzioni di Firebase
exports.sendEmailNotification = functionsV1.firestore
    .document('appointments/{appointmentId}')
    .onCreate(async (snapshot, context) => {
    const appointment = snapshot.data();
    if (!appointment)
        return null;
    const emailHtml = getEmailTemplate(appointment);
    const msg = {
        to: 'jaclin2704@gmail.com',
        from: 'info@g3dmakes.ch',
        subject: `Nuovo Appuntamento: ${appointment.date} - ${appointment.time}`,
        html: emailHtml,
    };
    try {
        await mail_1.default.send(msg);
        await admin.firestore()
            .collection('notifications')
            .add({
            type: 'email',
            status: 'success',
            appointmentId: context.params.appointmentId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.log('Email inviata con successo');
        return null;
    }
    catch (error) {
        await admin.firestore()
            .collection('notifications')
            .add({
            type: 'email',
            status: 'error',
            error: error.message || 'Errore sconosciuto',
            appointmentId: context.params.appointmentId,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
        console.error('Errore nell\'invio dell\'email:', error);
        throw new Error('Errore nell\'invio dell\'email');
    }
});
// Funzione di test per l'invio di email
exports.testSendGrid = functionsV1.https.onRequest(async (req, res) => {
    try {
        // Ottieni l'API key dalle configurazioni
        const SENDGRID_API_KEY = functionsV1.config().sendgrid.key;
        if (!SENDGRID_API_KEY) {
            res.status(500).send('API key di SendGrid non configurata');
            return;
        }
        mail_1.default.setApiKey(SENDGRID_API_KEY);
        // Crea un messaggio di test
        const msg = {
            to: 'jaclin2704@gmail.com',
            from: 'info@g3dmakes.ch', // Usa un dominio verificato su SendGrid
            subject: 'Test SendGrid',
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #d53f8c; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">JC Nails Lugano</h1>
          </div>
          <div style="padding: 20px; background-color: #fff5f7;">
            <h2 style="color: #d53f8c;">Email di Test</h2>
            <p>Questa è un'email di test per verificare il funzionamento di SendGrid.</p>
            <p>Data e ora: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
        };
        // Invia l'email
        await mail_1.default.send(msg);
        res.status(200).send('Email di test inviata con successo a jaclin2704@gmail.com');
    }
    catch (error) {
        console.error('Errore nell\'invio dell\'email di test:', error);
        res.status(500).send(`Errore: ${error.message || 'Errore sconosciuto'}`);
    }
});
//# sourceMappingURL=index.js.map