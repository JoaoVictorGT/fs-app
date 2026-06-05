import dotenv from 'dotenv';
dotenv.config();

import app from './app';

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`\n🏋️  Studio Fitness API`);
  console.log(`   Ambiente : ${process.env.NODE_ENV || 'development'}`);
  console.log(`   Porta    : ${PORT}`);
  console.log(`   Saúde    : http://localhost:${PORT}/api/health\n`);
  console.log('Credenciais de teste:');
  console.log('  Professor : maria@studiofitness.com / teacher123');
  console.log('  Aluno     : joao@email.com / student123\n');
});
