import type { AppSettings, AgentLlmConfig, ProviderConfig } from '@shared/types';

interface LlmRequest {
  systemPrompt: string;
  userMessage: string;
  agentConfig: AgentLlmConfig;
  providerConfig: ProviderConfig;
}

interface LlmResponse {
  content: string;
  model: string;
  usage?: { input: number; output: number };
}

/**
 * Provider-agnostic LLM client.
 * Supports Anthropic, OpenAI, DeepSeek, and custom OpenAI-compatible endpoints.
 */
export async function callLlm(req: LlmRequest): Promise<LlmResponse> {
  const { systemPrompt, userMessage, agentConfig, providerConfig } = req;

  switch (providerConfig.provider) {
    case 'anthropic':
      return callAnthropic(systemPrompt, userMessage, agentConfig, providerConfig);
    case 'openai':
    case 'deepseek':
    case 'custom':
    default:
      return callOpenAiCompatible(systemPrompt, userMessage, agentConfig, providerConfig);
  }
}

async function callAnthropic(
  system: string,
  user: string,
  cfg: AgentLlmConfig,
  provider: ProviderConfig
): Promise<LlmResponse> {
  const body = {
    model: provider.model,
    max_tokens: cfg.maxTokens || 2000,
    temperature: cfg.temperature ?? 0.7,
    system,
    messages: [{ role: 'user' as const, content: user }],
  };

  const res = await fetch(provider.baseUrl || 'https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': provider.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${err.slice(0, 300)}`);
  }

  const json: any = await res.json();
  return {
    content: json.content?.[0]?.text || '',
    model: json.model || provider.model,
    usage: json.usage ? { input: json.usage.input_tokens, output: json.usage.output_tokens } : undefined,
  };
}

async function callOpenAiCompatible(
  system: string,
  user: string,
  cfg: AgentLlmConfig,
  provider: ProviderConfig
): Promise<LlmResponse> {
  const body = {
    model: provider.model,
    max_tokens: cfg.maxTokens || 2000,
    temperature: cfg.temperature ?? 0.7,
    messages: [
      { role: 'system' as const, content: system },
      { role: 'user' as const, content: user },
    ],
  };

  let authHeader: string;
  if (provider.provider === 'deepseek') {
    authHeader = `Bearer ${provider.apiKey}`;
  } else {
    authHeader = `Bearer ${provider.apiKey}`;
  }

  const res = await fetch(provider.baseUrl || 'https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`LLM API error ${res.status}: ${err.slice(0, 300)}`);
  }

  const json: any = await res.json();
  return {
    content: json.choices?.[0]?.message?.content || '',
    model: json.model || provider.model,
    usage: json.usage ? { input: json.usage.prompt_tokens, output: json.usage.completion_tokens } : undefined,
  };
}

/**
 * Quick test that a provider config works — sends a simple ping and returns the response.
 */
export async function testConnection(provider: ProviderConfig): Promise<{ ok: boolean; message: string }> {
  try {
    const result = await callLlm({
      systemPrompt: 'Reply with exactly "OK" and nothing else.',
      userMessage: 'Ping',
      agentConfig: { enabled: true, providerId: provider.id, temperature: 0, maxTokens: 10, systemPrompt: '' },
      providerConfig: provider,
    });
    return { ok: true, message: `Connected — model: ${result.model}` };
  } catch (e: any) {
    return { ok: false, message: e.message };
  }
}
