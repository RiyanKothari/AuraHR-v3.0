import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userIdStr = searchParams.get('userid');
    
    if (!userIdStr) {
      return NextResponse.json({ error: 'Moodle user ID is required' }, { status: 400 });
    }

    const moodleUserId = parseInt(userIdStr, 10);
    
    const dbPath = path.join(process.cwd(), 'public', 'uploads', 'resume_analyses.json');
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ success: true, data: null });
    }
    
    const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const analysis = db[moodleUserId];
    
    if (!analysis) {
      return NextResponse.json({ success: true, data: null });
    }

    return NextResponse.json({ 
      success: true, 
      data: analysis
    });
    
  } catch (error: any) {
    console.error('Failed to fetch resume insight:', error);
    return NextResponse.json({ error: 'Failed to fetch resume insight' }, { status: 500 });
  }
}
