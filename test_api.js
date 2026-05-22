const fs = require('fs');

async function test() {
  try {
    const res = await fetch('http://localhost:3000/api/moodle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wsfunction: 'local_aurahr_jobs_get_job',
        params: { jobid: 1 },
        token: '0ca82eb392ee3d2572f6caa7144683e5' // Admin token just to test
      })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.error(e);
  }
}
test();
