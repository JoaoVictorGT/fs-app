import { auth, db } from '../config/firebase';
import { JwtPayload } from '../models/user.model';

/**
 * AuthService — com Firebase Auth o login acontece no frontend.
 * O backend apenas verifica o ID Token e retorna o perfil do Firestore.
 */
export class AuthService {
  async getProfile(token: string): Promise<JwtPayload> {
    const decoded = await auth.verifyIdToken(token);

    const userDoc = await db.collection('users').doc(decoded.uid).get();
    if (!userDoc.exists) {
      throw { status: 404, message: 'Perfil não encontrado. Contate o administrador.' };
    }

    const data = userDoc.data()!;
    return {
      userId:    decoded.uid,
      email:     decoded.email ?? data.email ?? '',
      role:      data.role,
      name:      data.name,
      profileId: decoded.uid,
      teacherId: data.teacherId ?? undefined,
    };
  }
}
