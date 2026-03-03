const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.join(__dirname, '.env.local') });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('--- Supabase Diagnostic ---');
console.log('URL:', url);
console.log('Key:', key ? 'FOUND' : 'MISSING');

if (!url || !key) {
    console.error('❌ Error: Missing environment variables.');
    process.exit(1);
}

const supabase = createClient(url, key);

async function check() {
    console.log('\nChecking health...');
    try {
        const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
        const res = await fetch(`${url}/auth/v1/health`);
        console.log('Health Check Status:', res.status, res.statusText);
        if (res.ok) {
            console.log('✅ Supabase Auth is UP!');
        } else {
            console.log('❌ Supabase Auth might be DOWN or PAUSED.');
        }

        console.log('\nTesting simple query...');
        const { data, error } = await supabase.from('profiles').select('count').limit(1);
        if (error) {
            console.error('❌ Query Error:', error.message);
        } else {
            console.log('✅ Query SUCCESS!');
        }
    } catch (err) {
        console.error('❌ Network Error:', err.message);
    }
}

check();
