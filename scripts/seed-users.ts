import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SERVICE_ROLE_KEY) {
  console.error(
    'Falta SUPABASE_SERVICE_ROLE_KEY en .env.local\n' +
      'Encuéntrala en: Supabase Dashboard → Settings → API → service_role',
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const USERS = [
  {
    email: 'director@unitru.edu.pe',
    password: 'Director123!',
    role: 'director',
    fullName: 'Carlos Méndez Vásquez',
  },
  {
    email: 'secretaria@unitru.edu.pe',
    password: 'Secretaria123!',
    role: 'secretaria',
    fullName: 'María López Torres',
  },
  {
    email: 'docente@unitru.edu.pe',
    password: 'Docente123!',
    role: 'docente',
    fullName: 'Juan Pérez Rojas',
  },
];

async function seed() {
  for (const user of USERS) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        role: user.role,
        full_name: user.fullName,
      },
    });

    if (error) {
      if (error.message.includes('already been registered')) {
        console.log(`⚠ ${user.email} ya existe — actualizando metadata...`);
        const { data: list } = await supabase.auth.admin.listUsers();
        const existing = list?.users.find((u) => u.email === user.email);
        if (existing) {
          await supabase.auth.admin.updateUserById(existing.id, {
            user_metadata: { role: user.role, full_name: user.fullName },
          });
          console.log(`  ✅ ${user.email} metadata actualizada`);
        }
      } else {
        console.error(`✗ ${user.email}: ${error.message}`);
      }
    } else {
      console.log(`✅ ${user.email} creado (${user.role})`);
    }
  }
}

seed();
