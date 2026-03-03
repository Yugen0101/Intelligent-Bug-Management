const { createClient } = require('@supabase/supabase-js');

const url = 'https://rviuxwoqrehggecomwwe.supabase.co';
const pubKey = 'sb_publishable_K53A6x4Uhv9CkIz8I_EBJQ_C8Lp5Fp8';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2aXV4d29xcmVoZ2dlY29td3dlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1MjkxOTUsImV4cCI6MjA4NjEwNTE5NX0.vZk7uTu9w5Gwd1mW_6Kmche6Zpw0OSc13xLkLdm19KI';

async function test(key, label) {
    console.log(`\n--- Testing ${label} ---`);
    const supabase = createClient(url, key);

    try {
        console.log('Checking connection...');
        // Using a direct fetch to health endpoint first to bypass any JS client issues
        const response = await fetch(`${url}/auth/v1/health`);
        console.log('Health check status:', response.status);

        console.log('Testing simple query (from profiles)...');
        const { data, error } = await supabase.from('profiles').select('count').limit(1);

        if (error) {
            console.error('❌ Error:', error.message);
        } else {
            console.log('✅ Success! Data fetched.');
        }
    } catch (err) {
        console.error('❌ Network failure:', err.message);
    }
}

async function run() {
    await test(pubKey, 'Publishable Key');
    await test(anonKey, 'Anon Key (Legacy)');
}

run();
