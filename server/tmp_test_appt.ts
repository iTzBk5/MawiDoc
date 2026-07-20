import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  try {
    const doctorUser = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });
    
    const loginRes = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: doctorUser.email, password: 'password123' })
    });
    const loginData = await loginRes.json();
    const token = loginData.data.token;

    const res = await fetch('http://localhost:3000/api/v1/appointments/doctor', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({
        patientName: 'Test Walkin',
        slotId: '',
        date: '2026-07-15',
        startTime: '10:00',
        endTime: '10:30',
      })
    });
    const data = await res.json();

    if (!res.ok) {
      console.error('Error:', res.status, JSON.stringify(data, null, 2));
    } else {
      console.log('Success:', data);
    }
  } catch (err: any) {
    console.error('Error:', err.message);
  }
}

test();
