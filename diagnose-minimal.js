const url = "https://dprqdrxmhikqddaglsov.supabase.co";

async function test() {
    console.log("Testing reachability for: " + url);
    try {
        const start = Date.now();
        const response = await fetch(url + "/auth/v1/health");
        const end = Date.now();
        console.log("Status: " + response.status + " " + response.statusText);
        console.log("Time: " + (end - start) + "ms");
        if (response.ok) {
            console.log("✅ SUCCESS: Supabase is reachable!");
        } else {
            console.log("❌ FAILED: Supabase returned error status.");
        }
    } catch (e) {
        console.log("❌ ERROR: Connection failed - " + e.message);
    }
}

test();
