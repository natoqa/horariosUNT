import { createClient } from '@supabase/supabase-js';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

function loadEnvLocal() {
  const envPath = resolve(process.cwd(), '.env.local');
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!SUPABASE_URL || !ANON_KEY) {
  console.error('Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local');
  process.exit(1);
}

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

async function createWithServiceRole() {
  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const user of USERS) {
    const { error } = await supabase.auth.admin.createUser({
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
            password: user.password,
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

async function createWithSignUp() {
  console.log('Sin SERVICE_ROLE_KEY — intentando registro con anon key...\n');
  const supabase = createClient(SUPABASE_URL!, ANON_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const user of USERS) {
    const { error } = await supabase.auth.signUp({
      email: user.email,
      password: user.password,
      options: {
        data: { role: user.role, full_name: user.fullName },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        console.log(`⚠ ${user.email} ya existe`);
      } else {
        console.error(`✗ ${user.email}: ${error.message}`);
      }
    } else {
      console.log(`✅ ${user.email} registrado (${user.role})`);
    }
  }
}

async function verifyConnection() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    headers: { apikey: ANON_KEY!, Authorization: `Bearer ${ANON_KEY}` },
  });
  if (res.status === 401) {
    const body = await res.json().catch(() => ({}));
    console.error(
      '❌ La anon key de .env.local no es válida para este proyecto.\n' +
        '   Copia la clave "anon public" desde Supabase → Settings → API.\n',
    );
    if (body?.message) console.error(`   Detalle: ${body.message}`);
    process.exit(1);
  }
}

async function seed() {
  await verifyConnection();

  if (SERVICE_ROLE_KEY) {
    await createWithServiceRole();
  } else {
    console.log(
      'Tip: agrega SUPABASE_SERVICE_ROLE_KEY en .env.local para crear usuarios confirmados al instante.\n',
    );
    await createWithSignUp();
  }

  console.log('\nListo. Prueba iniciar sesión con director@unitru.edu.pe / Director123!');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
