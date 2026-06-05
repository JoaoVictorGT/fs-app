import nodemailer from 'nodemailer';

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

interface BookingEmailData {
  studentName: string;
  studentEmail: string;
  teacherName: string;
  date: string;
  startTime: string;
  endTime: string;
  academy: string;
}

export async function sendBookingConfirmationEmail(data: BookingEmailData): Promise<void> {
  if (!process.env.SMTP_USER) {
    console.log('[Email] SMTP_USER not configured — skipping confirmation email');
    return;
  }

  const transport = createTransport();
  await transport.sendMail({
    from: process.env.EMAIL_FROM || 'Studio Fitness <noreply@studiofitness.com>',
    to: data.studentEmail,
    subject: 'Aula confirmada — Studio Fitness',
    html: `
      <div style="font-family:sans-serif;background:#0D0D0D;color:#fff;padding:32px;border-radius:8px;">
        <h1 style="color:#F5C400;margin-bottom:8px;">Studio Fitness</h1>
        <p>Olá, <strong>${data.studentName}</strong>!</p>
        <p>Sua aula foi <strong style="color:#22C55E;">confirmada</strong>.</p>
        <table style="margin:16px 0;border-collapse:collapse;">
          <tr><td style="padding:4px 8px;color:#A0A0A0;">Professor:</td><td style="padding:4px 8px;">${data.teacherName}</td></tr>
          <tr><td style="padding:4px 8px;color:#A0A0A0;">Data:</td><td style="padding:4px 8px;">${data.date}</td></tr>
          <tr><td style="padding:4px 8px;color:#A0A0A0;">Horário:</td><td style="padding:4px 8px;">${data.startTime} – ${data.endTime}</td></tr>
          <tr><td style="padding:4px 8px;color:#A0A0A0;">Academia:</td><td style="padding:4px 8px;">${data.academy}</td></tr>
        </table>
        <p style="color:#A0A0A0;font-size:13px;">Para cancelar, acesse a plataforma com no mínimo 24 horas de antecedência.</p>
      </div>
    `,
  });
}

export async function sendCancellationEmail(data: BookingEmailData): Promise<void> {
  if (!process.env.SMTP_USER) {
    console.log('[Email] SMTP_USER not configured — skipping cancellation email');
    return;
  }

  const transport = createTransport();
  await transport.sendMail({
    from: process.env.EMAIL_FROM || 'Studio Fitness <noreply@studiofitness.com>',
    to: data.studentEmail,
    subject: 'Agendamento cancelado — Studio Fitness',
    html: `
      <div style="font-family:sans-serif;background:#0D0D0D;color:#fff;padding:32px;border-radius:8px;">
        <h1 style="color:#F5C400;margin-bottom:8px;">Studio Fitness</h1>
        <p>Olá, <strong>${data.studentName}</strong>!</p>
        <p>Seu agendamento foi <strong style="color:#EF4444;">cancelado</strong>.</p>
        <table style="margin:16px 0;border-collapse:collapse;">
          <tr><td style="padding:4px 8px;color:#A0A0A0;">Professor:</td><td style="padding:4px 8px;">${data.teacherName}</td></tr>
          <tr><td style="padding:4px 8px;color:#A0A0A0;">Data:</td><td style="padding:4px 8px;">${data.date}</td></tr>
          <tr><td style="padding:4px 8px;color:#A0A0A0;">Horário:</td><td style="padding:4px 8px;">${data.startTime} – ${data.endTime}</td></tr>
        </table>
        <p style="color:#A0A0A0;font-size:13px;">Acesse a plataforma para reagendar.</p>
      </div>
    `,
  });
}
