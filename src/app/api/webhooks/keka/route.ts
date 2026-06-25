import { NextResponse } from 'next/server';

const MOODLE_URL = process.env.MOODLE_URL || 'http://localhost/moodle';
const ADMIN_TOKEN = process.env.MOODLE_ADMIN_TOKEN || '';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Extract Keka Payload
    // Expected generic structure: { applicant: { firstName, lastName, email, resumeUrl }, jobId }
    const applicant = body.applicant || body;
    const jobId = body.jobId || 1; // Default to 1 if not provided for testing
    
    if (!applicant.email || !applicant.firstName) {
      return NextResponse.json({ error: 'Missing applicant details' }, { status: 400 });
    }

    if (!ADMIN_TOKEN) {
      console.error('MOODLE_ADMIN_TOKEN is missing');
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    // 2. Auto-create Candidate Account (Bypass manual signup)
    // Generate a secure random password since they will use a magic link
    const tempPassword = `AuraHR!${Math.random().toString(36).slice(-8)}Aa1`;
    const username = applicant.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '') + Math.floor(Math.random() * 1000);

    const createUrl = new URL(`${MOODLE_URL}/webservice/rest/server.php`);
    createUrl.searchParams.set('wstoken', ADMIN_TOKEN);
    createUrl.searchParams.set('wsfunction', 'core_user_create_users');
    createUrl.searchParams.set('moodlewsrestformat', 'json');
    createUrl.searchParams.set('users[0][username]', username);
    createUrl.searchParams.set('users[0][password]', tempPassword);
    createUrl.searchParams.set('users[0][firstname]', applicant.firstName);
    createUrl.searchParams.set('users[0][lastname]', applicant.lastName || 'Candidate');
    createUrl.searchParams.set('users[0][email]', applicant.email);
    createUrl.searchParams.set('users[0][department]', 'candidate');

    const createRes = await fetch(createUrl.toString());
    const createData = await createRes.json();

    if (createData.exception) {
      console.error('[Keka Webhook] Failed to create user:', createData);
      return NextResponse.json({ error: createData.message }, { status: 400 });
    }

    const userId = createData[0].id;
    console.log(`[Keka Webhook] Created Candidate User ID: ${userId}`);

    // 3. Login to get Candidate Token to apply for job
    const tokenUrl = new URL(`${MOODLE_URL}/login/token.php`);
    tokenUrl.searchParams.set('username', username);
    tokenUrl.searchParams.set('password', tempPassword);
    tokenUrl.searchParams.set('service', process.env.MOODLE_SERVICE || 'aurahr_jobs');

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();
    const candidateToken = tokenData.token;

    // 4. Apply for the job in Moodle
    if (candidateToken) {
      const applyUrl = new URL(`${MOODLE_URL}/webservice/rest/server.php`);
      applyUrl.searchParams.set('wstoken', candidateToken);
      applyUrl.searchParams.set('wsfunction', 'local_aurahr_jobs_apply');
      applyUrl.searchParams.set('moodlewsrestformat', 'json');
      applyUrl.searchParams.set('jobid', String(jobId));
      applyUrl.searchParams.set('city', applicant.city || 'Unknown');
      applyUrl.searchParams.set('country', applicant.country || 'Unknown');
      applyUrl.searchParams.set('phone', applicant.phone || '0000000000');
      applyUrl.searchParams.set('education_details', applicant.education || 'N/A');
      applyUrl.searchParams.set('bio', 'Imported from Keka');
      
      // Pass the resume URL if available so the JD parser can use it
      if (applicant.resumeUrl) {
         applyUrl.searchParams.set('resume_url', applicant.resumeUrl);
      }

      await fetch(applyUrl.toString());
      console.log(`[Keka Webhook] Candidate applied to Job ${jobId}`);
      
      // Simulate Magic Link Generation
      const magicLink = `http://localhost:3000/api/auth/magic?token=${Buffer.from(`${username}:${tempPassword}`).toString('base64')}`;
      
      console.log(`\n======================================================`);
      console.log(`[SIMULATED EMAIL TO ${applicant.email}]`);
      console.log(`Subject: You're invited to complete your application`);
      console.log(`Your resume has been received from Keka. Please access your candidate dashboard here:`);
      console.log(`${magicLink}`);
      console.log(`======================================================\n`);
    }

    // 5. Trigger async JD Parsing (In production, this should be offloaded to a queue)
    // We acknowledge the Keka webhook immediately below.
    
    return NextResponse.json({ 
      success: true, 
      message: 'Candidate created and applied successfully',
      candidateId: userId
    }, { status: 200 });

  } catch (error: any) {
    console.error('[Keka Webhook Error]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
