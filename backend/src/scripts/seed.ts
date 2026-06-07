/**
 * Seed Script — Studio Fitness
 * ─────────────────────────────
 * Cria usuários de demonstração no Firebase Auth + Firestore.
 *
 * Uso:
 *   cd backend
 *   npx ts-node src/scripts/seed.ts
 *
 * ⚠️  Execute apenas uma vez (em um Firestore vazio).
 *     Para reexecutar, apague as coleções no console Firebase primeiro.
 */

import dotenv from 'dotenv';
dotenv.config(); // carrega .env ANTES de importar firebase

import { db, auth } from '../config/firebase';
import admin from '../config/firebase';

// ── Definições de usuários de seed ───────────────────────────────────────────

interface SeedUser {
  email:       string;
  password:    string;
  name:        string;
  role:        'teacher' | 'student';
  academy?:    string;   // teachers only
  studentType?: 'personal' | 'group';
  phone?:      string;
  bio?:        string;
}

const ACADEMY_NAME = 'Studio Fitness Centro';

const SEED_USERS: SeedUser[] = [
  {
    email:    'maria@studiofitness.com',
    password: 'teacher123',
    name:     'Maria Santos',
    role:     'teacher',
    academy:  ACADEMY_NAME,
    phone:    '(41) 99900-0001',
    bio:      'Personal trainer com 10 anos de experiência. Especialista em musculação e funcional.',
  },
  {
    email:    'joao.alves@studiofitness.com',
    password: 'teacher123',
    name:     'João Alves',
    role:     'teacher',
    academy:  ACADEMY_NAME,
    phone:    '(41) 99900-0002',
    bio:      'Professor de yoga e pilates com foco em bem-estar e qualidade de vida.',
  },
];

// ── Funções auxiliares ────────────────────────────────────────────────────────

async function createOrGetUser(user: SeedUser): Promise<{ uid: string; isNew: boolean }> {
  try {
    const existing = await auth.getUserByEmail(user.email);
    console.log(`  ⚠  Usuário já existe no Firebase Auth: ${user.email} (uid: ${existing.uid})`);
    return { uid: existing.uid, isNew: false };
  } catch (err: any) {
    if (err.code !== 'auth/user-not-found') throw err;
  }

  const record = await auth.createUser({
    email:       user.email,
    password:    user.password,
    displayName: user.name,
  });
  console.log(`  ✓  Usuário criado no Firebase Auth: ${user.email} (uid: ${record.uid})`);
  return { uid: record.uid, isNew: true };
}

async function createAcademy(): Promise<string> {
  const snap = await db.collection('academies')
    .where('name', '==', ACADEMY_NAME)
    .limit(1)
    .get();

  if (!snap.empty) {
    console.log(`  ⚠  Academia já existe: ${ACADEMY_NAME}`);
    return snap.docs[0].id;
  }

  const ref = await db.collection('academies').add({
    name:    ACADEMY_NAME,
    address: 'Av. Sete de Setembro, 1234 — Curitiba, PR',
    phone:   '(41) 3300-0000',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  console.log(`  ✓  Academia criada: ${ACADEMY_NAME} (id: ${ref.id})`);
  return ref.id;
}

async function createSampleSlots(teacherUid: string): Promise<void> {
  const batch = db.batch();
  const today = new Date();

  // Cria 10 slots nos próximos 14 dias
  const slots = [];
  for (let i = 1; i <= 14; i += 2) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    slots.push(
      {
        teacherId:       teacherUid,
        date:            dateStr,
        startTime:       '07:00',
        endTime:         '08:00',
        capacity:        1,
        currentBookings: 0,
        type:            'individual',
        status:          'available',
        description:     'Treino individual — funcional',
        createdAt:       admin.firestore.FieldValue.serverTimestamp(),
      },
      {
        teacherId:       teacherUid,
        date:            dateStr,
        startTime:       '09:00',
        endTime:         '10:00',
        capacity:        8,
        currentBookings: 0,
        type:            'group',
        status:          'available',
        description:     'Aula em grupo — yoga matinal',
        createdAt:       admin.firestore.FieldValue.serverTimestamp(),
      }
    );
  }

  slots.forEach(slot => {
    const ref = db.collection('slots').doc();
    batch.set(ref, slot);
  });

  await batch.commit();
  console.log(`  ✓  ${slots.length} slots criados para o professor ${teacherUid}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function seed(): Promise<void> {
  console.log('\n🌱  Studio Fitness — Seed Script\n');

  const academyId = await createAcademy();
  console.log('');

  const teacherUids: string[] = [];

  for (const user of SEED_USERS) {
    const { uid } = await createOrGetUser(user);

    const docRef  = db.collection('users').doc(uid);
    const docSnap = await docRef.get();

    if (docSnap.exists) {
      console.log(`  ⚠  Documento Firestore já existe para: ${user.email}`);
    } else {
      await docRef.set({
        uid,
        name:        user.name,
        email:       user.email,
        role:        user.role,
        academyId,
        academyName: user.academy ?? ACADEMY_NAME,
        phone:       user.phone   ?? null,
        bio:         user.bio     ?? null,
        studentType: user.studentType ?? null,
        teacherId:   null,
        createdAt:   admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`  ✓  Documento Firestore criado para: ${user.email}`);
    }

    if (user.role === 'teacher') teacherUids.push(uid);
  }

  console.log('');

  // Cria slots para o primeiro professor
  if (teacherUids.length > 0) {
    await createSampleSlots(teacherUids[0]);
  }

  console.log('\n✅  Seed concluído!\n');
  console.log('Credenciais de acesso:');
  SEED_USERS.forEach(u =>
    console.log(`  ${u.role === 'teacher' ? 'Professor' : 'Aluno   '}: ${u.email} / ${u.password}`)
  );
  console.log('');
  process.exit(0);
}

seed().catch(err => {
  console.error('\n❌  Erro no seed:', err);
  process.exit(1);
});
