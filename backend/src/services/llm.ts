import logger from '../logger';

const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const TIMEOUT_MS = 8000;

export interface LlmResult {
  content: string;
  model: string;
}

export async function callLlm(prompt: string): Promise<LlmResult> {
  const apiKey = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL ?? 'llama-3.3-70b-versatile';

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_BASE_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 300,
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      logger.error({ event: 'llm_error', status: response.status, message: text });
      const err = new Error('LLM_ERROR') as Error & { code: string; status: number };
      err.code = 'LLM_ERROR';
      err.status = response.status;
      throw err;
    }

    const data = (await response.json()) as {
      choices: { message: { content: string } }[];
      model: string;
    };

    return {
      content: data.choices[0].message.content.trim(),
      model: data.model ?? model,
    };
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      logger.error({ event: 'llm_error', status: 504, message: 'Request timed out' });
      const timeoutErr = new Error('LLM_TIMEOUT') as Error & { code: string };
      timeoutErr.code = 'LLM_TIMEOUT';
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}
