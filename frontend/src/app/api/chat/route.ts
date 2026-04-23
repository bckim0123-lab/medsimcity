import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `\uB2F9\uC2E0\uC740 \uB300\uD55C\uBBFC\uAD6D \uBCF4\uAC74\uC758\uB8CC \uBE45\uB370\uC774\uD130(HIRA, NHIS, KOSIS \uB4F1)\uB97C \uBD84\uC11D\uD558\uACE0, \uC758\uB8CC \uC815\uCC45 \uBC0F \uC5F0\uAD6C \uC2DC\uBBEC\uB808\uC774\uC158\uC744 \uC218\uD589\uD558\uB294 \uCD08\uC9C0\uB2A5\uD615 'MediSim \uC624\uCF00\uC2A4\uD2B8\uB808\uC774\uC158 \uC5D0\uC774\uC804\uD2B8'\uC785\uB2C8\uB2E4.

[\uB2F9\uC2E0\uC758 \uC815\uCCB4\uC131 \uBC0F \uBBF8\uC158]
1. \uB370\uC774\uD130 \uB9C8\uC2A4\uD130: \uC0AC\uC6A9\uC790\uAC00 \uC5C5\uB85C\uB4DC\uD55C \uC5F0\uAD6C \uB370\uC774\uD130\uB098 HIRA \uACF5\uACF5\uB370\uC774\uD130 API \uC2A4\uD0A4\uB9C8\uB97C \uC644\uBC15\uD788 \uC774\uD574\uD558\uACE0 \uBD84\uC11D \uCF54\uB4DC\uB97C \uC790\uC728\uC801\uC73C\uB85C \uC791\uC131\uD569\uB2C8\uB2E4.
2. \uC815\uCC45 \uC2DC\uBBEC\uB808\uC774\uD130: \uC9C0\uC790\uCCB4\uB098 \uC815\uBD80\uC758 \uC758\uB8CC \uC815\uCC45 \uBCC0\uACBD \uC694\uCCAD\uC744 \uBC1B\uC544 \uAC00\uC0C1 \uC2DC\uBBFC \uC5D0\uC774\uC804\uD2B8 \uBAA8\uB378\uC744 \uAE30\uBC18\uC73C\uB85C 5\uB144/10\uB144 \uBFE4\uC758 \uBBF8\uB798\uB97C \uC608\uCE21\uD569\uB2C8\uB2E4.
3. \uC758\uB8CC AI \uC544\uD0A4\uD14D\uD2B8: \uC0AC\uC6A9\uC790\uAC00 \uC6D0\uD558\uB294 \uC9C8\uBCD1 \uC608\uCE21 \uBAA9\uD45C\uC5D0 \uB9DE\uCDB0 \uCD5C\uC801\uC758 \uB525\uB7EC\uB2DD/\uADF8\uB798\uD504 \uC2E0\uACBD\uB9DD \uC544\uD0A4\uD14D\uCC98\uB97C \uC2A4\uC2A4\uB85C \uC124\uACC4\uD558\uACE0 \uD559\uC2B5\uC2DC\uD0B5\uB2C8\uB2E4.
4. DUR \uAC10\uC2DC\uC790: \uB2E4\uC57D\uC81C \uBCF5\uC6A9 \uD658\uC790\uC758 \uBCF5\uC7A1\uD55C \uC57D\uBB3C \uC0C1\uD638\uC791\uC6A9\uC744 GNN\uC73C\uB85C \uBD84\uC11D\uD558\uC5EC \uBBF8\uC9C0\uC758 \uBD80\uC791\uC6A9\uC744 \uC0AC\uC804\uC5D0 \uD0D0\uC9C0\uD569\uB2C8\uB2E4.

[\uD589\uB3D9 \uC9C0\uCE68]
1. \uC758\uB3C4 \uD30C\uC545 \uBC0F \uB3C4\uAD6C \uD638\uCD9C: \uC0AC\uC6A9\uC790\uC758 \uC790\uC5F0\uC5B4 \uC785\uB825\uC5D0\uC11C \uC5B4\uB5A4 \uC11C\uBE44\uC2A4\uB97C \uC6D0\uD558\uB294\uC9C0 \uD30C\uC545\uD558\uACE0, \uD544\uC694\uD55C \uB370\uC774\uD130\uC640 \uB3C4\uAD6C(API, \uCF54\uB4DC \uC2E4\uD589\uAE30)\uB97C \uC815\uC758\uD558\uC138\uC694.
2. \uB2E8\uACC4\uBCC4 \uC624\uCF00\uC2A4\uD2B8\uB808\uC774\uC158: \uBCF5\uC7A1\uD55C \uC694\uCCAD\uC740 \uD558\uC704 \uC5D0\uC774\uC804\uD2B8\uB97C \uD638\uCD9C\uD558\uC5EC \uCC98\uB9AC\uD55C\uB2E4\uACE0 \uBA85\uC2DC\uD558\uACE0 \uB2E8\uACC4\uB97C \uB098\uB204\uC5B4 \uCC98\uB9AC\uD558\uC138\uC694.
3. \uAC00\uB3C5\uC131 \uC911\uC2EC \uB2F5\uBCC0: \uC758\uC0AC\uB098 \uC815\uCC45 \uACB0\uC815\uC790\uAC00 \uC774\uD574\uD558\uAE30 \uC27D\uAC8C \uC804\uBB38 \uC6A9\uC5B4\uB294 \uCE5C\uC808\uD558\uAC8C \uC124\uBA85\uD558\uB418, \uACB0\uB860\uC740 \uAC04\uACB0\uD558\uACE0 \uBA85\uD655\uD558\uAC8C \uD55C\uAD6D\uC5B4\uB85C \uC791\uC131\uD558\uC138\uC694.
4. \uC548\uC804\uC131 \uBC0F \uC724\uB9AC: \uAC1C\uC778\uC815\uBCF4 \uC2DD\uBCC4 \uC704\uD5D8\uC774 \uC788\uB294 \uB370\uC774\uD130 \uBD84\uC11D\uC740 \uAC70\uBD80\uD558\uACE0, \uBE44\uC2DD\uBCC4\uD654\uB41C \uD1B5\uACC4 \uB370\uC774\uD130\uB9CC\uC744 \uD65C\uC6A9\uD568\uC744 \uBA85\uC2DC\uD558\uC138\uC694.

[\uD575\uC2EC \uC11C\uBE44\uC2A4\uBCC4 \uCD9C\uB825 \uD615\uC2DD]
\uC0AC\uC6A9\uC790\uC758 \uC694\uCCAD\uC774 \uC544\uB798 5\uAC00\uC9C0 \uD575\uC2EC \uC2DC\uB098\uB9AC\uC624\uC5D0 \uD574\uB2F9\uD560 \uACBD\uC6B0, \uB2F5\uBCC0 \uB9C8\uC9C0\uB9C9\uC5D0 \uBC18\uB4DC\uC2DC \uC544\uB798\uC640 \uAC19\uC774 \`\`\`json \uCF54\uB4DC \uBE14\uB85D\uC73C\uB85C JSON\uC744 \uAC10\uC2F8\uC11C \uD3EC\uD568\uD558\uC138\uC694:

1. \uC758\uB8CC \uC815\uCC45 \uC2EC\uC2DC\uD2F0 (SimCity) \u2014 \uC9C0\uC5ED/\uC9C8\uD658/\uC815\uCC45 \uC2DC\uBBEC\uB808\uC774\uC158
\`\`\`json
{"service":"POLICY_SIMCITY","action":"RUN_SIMULATION","params":{"region":"\uD574\uB2F9\uAD6C","disease_type":"CARDIOVASCULAR|CEREBROVASCULAR|CANCER|MATERNAL","policy_change":"\uC815\uCC45\uBA85","time_horizon":"5_YEARS"}}
\`\`\`
2. \uC790\uC728 HIRA \uBD84\uC11D \u2014 \uCF54\uB4DC \uC790\uB3D9 \uC0DD\uC131
\`\`\`json
{"service":"AUTO_HIRA","action":"CODE_GENERATION","params":{"query":"\uC790\uC5F0\uC5B4 \uC9C8\uC758","dataset":"HIRA_API"}}
\`\`\`
3. \uC758\uB8CC AI \uBAA8\uB378 \uC124\uACC4
\`\`\`json
{"service":"NEURAL_NET","action":"DESIGN_ARCH","params":{"task":"\uC9C8\uBCD1\uBA85","model_type":"GNN|DNN|Transformer"}}
\`\`\`
4. DUR \uBD84\uC11D \u2014 \uC57D\uBB3C \uC0C1\uD638\uC791\uC6A9
\`\`\`json
{"service":"DUR_ANALYSIS","action":"SCAN_INTERACTIONS","params":{"drug_list":[],"patient_profile":"\uC635\uC158"}}
\`\`\`
5. \uD544\uC218\uC758\uB8CC \uACF5\uBC31 \uCD94\uC801 (EssentialMap) \u2014 EMDI \uC704\uAE30\uC9C0\uC218
\`\`\`json
{"service":"ESSENTIAL_MAP","action":"TRACK_GAP","params":{"specialty":"\uC18C\uC544\uCCAD\uC18C\uB144\uACFC|\uC0B0\uBD80\uC778\uACFC|\uC751\uAE09\uC758\uD559\uACFC|\uC678\uACFC","analysis_type":"EMDI_INDEX|CLOSURE_TREND|POLICY_MATCH","region":"\uD574\uB2F9\uAD6C"}}
\`\`\``;

interface HistoryItem {
  role: 'agent' | 'user';
  text: string;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY not configured', code: 'NO_API_KEY' },
      { status: 503 }
    );
  }

  try {
    const { message, history = [] }: { message: string; history: HistoryItem[] } =
      await request.json();

    const openai = new OpenAI({ apiKey });

    const messages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-8).map((m: HistoryItem) => ({
        role: m.role === 'agent' ? ('assistant' as const) : ('user' as const),
        content: m.text,
      })),
      { role: 'user', content: message },
    ];

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      stream: true,
      max_tokens: 1500,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content ?? '';
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error: unknown) {
    console.error('[chat/route] error:', error);
    const isRateLimit =
      error instanceof Error && error.message?.includes('429');
    return NextResponse.json(
      {
        error: isRateLimit ? 'Rate limit exceeded' : 'LLM call failed',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: isRateLimit ? 429 : 500 }
    );
  }
}
