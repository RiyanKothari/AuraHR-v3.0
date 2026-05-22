import { NextResponse } from 'next/server';
import { getDb, saveDb } from '@/lib/db';

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const db = await getDb();
    const index = db.candidates.findIndex((c: any) => c.id === id);
    
    if (index === -1) return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });

    db.candidates[index] = { ...db.candidates[index], ...body };
    await saveDb(db);

    return NextResponse.json({ success: true, candidate: db.candidates[index] });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
