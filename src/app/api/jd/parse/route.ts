import { NextResponse } from 'next/server';
import { getStructuredAIResponse } from '@/lib/neev';

export async function POST(req: Request) {
  try {
    const { jdText, department } = await req.json();

    // 1. Mock Existing Team Skills for Gap Analysis
    const teamMembers = [
      { role: 'Developer', skills: ['React', 'Node.js'] }
    ];

    const teamContext = JSON.stringify(teamMembers);

    // 2. LLM 4-Box Analysis
    const prompt = `
      Analyze this Job Description and the current Team Context.
      JD: "${jdText}"
      Team Context: ${teamContext}

      Provide a 4-box analysis:
      1. Must-Have: Mandatory technical skills.
      2. Good-to-Have: Supportive skills/experience.
      3. Future-Proof: Emerging skills (AI, cloud-native, etc.) that would make this hire strategic for 2025.
      4. Team-Gap: Skills that are MISSING or weak in the current team but needed for this role.
    `;

    interface JDAnalysis {
      role: string;
      mustHave: string[];
      goodToHave: string[];
      futureProof: string[];
      teamGap: string[];
      summary: string;
    }

    const analysis = await getStructuredAIResponse<JDAnalysis>(prompt, 
      "You are a technical hiring strategist. Return JSON with the 4-box breakdown."
    );

    if (!analysis) throw new Error("JD Analysis failed.");

    // 3. Mock Save JD to DB
    return NextResponse.json({ ...analysis, id: Math.floor(Math.random() * 1000) });

  } catch (error: any) {
    console.error("JD Parser Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
