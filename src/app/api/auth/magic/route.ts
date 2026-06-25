import { NextResponse } from 'next/server';

const MOODLE_URL = process.env.MOODLE_URL || 'http://localhost/moodle';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username, password] = decoded.split(':');

    if (!username || !password) {
      return NextResponse.redirect(new URL('/login?error=InvalidToken', request.url));
    }

    // Call Moodle Login
    const tokenUrl = new URL(`${MOODLE_URL}/login/token.php`);
    tokenUrl.searchParams.set('username', username);
    tokenUrl.searchParams.set('password', password);
    tokenUrl.searchParams.set('service', process.env.MOODLE_SERVICE || 'aurahr_jobs');

    const tokenRes = await fetch(tokenUrl.toString());
    const tokenData = await tokenRes.json();

    if (tokenData.error || !tokenData.token) {
      return NextResponse.redirect(new URL('/login?error=InvalidCredentials', request.url));
    }

    const wstoken = tokenData.token;

    // Fetch user profile
    const profileUrl = new URL(`${MOODLE_URL}/webservice/rest/server.php`);
    profileUrl.searchParams.set('wstoken', wstoken);
    profileUrl.searchParams.set('wsfunction', 'core_webservice_get_site_info');
    profileUrl.searchParams.set('moodlewsrestformat', 'json');

    const profileRes = await fetch(profileUrl.toString());
    const profile = await profileRes.json();

    if (profile.exception) {
      return NextResponse.redirect(new URL('/login?error=ProfileError', request.url));
    }

    // Set Cookies
    const user = {
      id: profile.userid,
      username: profile.username,
      firstname: profile.firstname,
      lastname: profile.lastname,
      email: profile.useremail || '',
      role: 'candidate',
    };

    const response = NextResponse.redirect(new URL('/candidate', request.url));
    
    // Secure cookies (same as lib/moodle.ts)
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    response.cookies.set('aurahr_token', encodeURIComponent(wstoken), { path: '/', expires, sameSite: 'strict' });
    response.cookies.set('aurahr_user', encodeURIComponent(JSON.stringify(user)), { path: '/', expires, sameSite: 'strict' });

    return response;

  } catch (err) {
    console.error('[Magic Link Auth Error]', err);
    return NextResponse.redirect(new URL('/login?error=ServerError', request.url));
  }
}
