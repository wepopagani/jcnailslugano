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
exports.testSendGrid = void 0;
const functions = __importStar(require("firebase-functions"));
const mail_1 = __importDefault(require("@sendgrid/mail"));
exports.testSendGrid = functions.https.onRequest(async (req, res) => {
    try {
        // Ottieni l'API key dalle configurazioni
        const SENDGRID_API_KEY = functions.config().sendgrid.key;
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
//# sourceMappingURL=test-email.js.map