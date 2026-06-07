import * as admin from 'firebase-admin';

// Inicializa o Firebase Admin SDK apenas uma vez (hot-reload safe)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // As variáveis de ambiente armazenam \n como literal — precisamos converter para quebra real
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

export const db = admin.firestore();
export const auth = admin.auth();
export default admin;
