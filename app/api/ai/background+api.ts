import Anthropic from '@anthropic-ai/sdk';
import { BACKGROUND_SYSTEM, BACKGROUND_USER } from '../../../src/services/claude/prompts';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { base64Image, mimeType } = body as { base64Image: string; mimeType: string };

    if (!base64Image || !mimeType) {
      return Response.json({ error: 'base64Image and mimeType are required' }, { status: 400 });
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      temperature: 0,
      system: BACKGROUND_SYSTEM,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mimeType as 'image/jpeg', data: base64Image } },
            { type: 'text', text: BACKGROUND_USER },
          ],
        },
      ],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    const result = JSON.parse(text);
    return Response.json(result);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Internal server error';
    return Response.json({ error: msg }, { status: 500 });
  }
}
