const PLATFORM_DEFAULT_AI_KEY = import.meta.env?.VITE_AI_API_KEY || '';

const getEnv = (key, fallback = '') => (typeof import.meta !== 'undefined' && import.meta.env?.[key]) || fallback;

function getStoredConfig() {
  try {
    const raw = localStorage.getItem('nexora_ai_config');
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}

function getApiKey() {
  const stored = getStoredConfig();
  return stored.apiKey || PLATFORM_DEFAULT_AI_KEY;
}

function getProvider() {
  const stored = getStoredConfig();
  return stored.provider || getEnv('VITE_AI_PROVIDER', 'gemini');
}

function getModel() {
  const stored = getStoredConfig();
  return stored.model || getEnv('VITE_AI_MODEL', 'gemini-3.5-flash-lite');
}

export function saveAIConfig({ apiKey, provider, model }) {
  const current = getStoredConfig();
  const updated = {
    ...current,
    ...(apiKey !== undefined && { apiKey }),
    ...(provider !== undefined && { provider }),
    ...(model !== undefined && { model }),
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem('nexora_ai_config', JSON.stringify(updated));
  if (apiKey) {
    localStorage.setItem('nexora_admin_master_ai_key', apiKey);
  }
}

export function getAIConfig() {
  return {
    apiKey: getApiKey(),
    provider: getProvider(),
    model: getModel(),
    hasKey: !!getApiKey(),
  };
}

export function clearAIConfig() {
  localStorage.removeItem('nexora_ai_config');
}

const ENDPOINTS = {
  gemini: (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
  openai: () => 'https://api.openai.com/v1/chat/completions',
};

const STREAM_ENDPOINTS = {
  gemini: (model) => `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
  openai: () => 'https://api.openai.com/v1/chat/completions',
};

function buildGeminiPayload(messages, options = {}) {
  const contents = messages.map(msg => ({
    role: msg.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: msg.content }],
  }));
  return {
    contents,
    generationConfig: {
      temperature: options.temperature ?? 0.7,
      maxOutputTokens: options.maxTokens ?? 8192,
      topP: options.topP ?? 0.95,
    },
  };
}

function buildOpenAIPayload(messages, options = {}) {
  return {
    model: options.model || getModel(),
    messages: messages.map(msg => ({ role: msg.role, content: msg.content })),
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens ?? 4096,
    stream: options.stream ?? false,
  };
}

function getHeaders(provider) {
  if (provider === 'gemini') {
    return { 'Content-Type': 'application/json' };
  }
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getApiKey()}`,
  };
}

function getEndpoint(provider, model, stream = false) {
  const endpoints = stream ? STREAM_ENDPOINTS : ENDPOINTS;
  const fn = endpoints[provider];
  if (!fn) throw new Error(`Unsupported AI provider: ${provider}`);
  const url = fn(model);
  const apiKey = getApiKey();
  if (provider === 'gemini' && !stream) {
    return `${url}?key=${apiKey}`;
  }
  if (provider === 'gemini' && stream) {
    return `${url}&key=${apiKey}`;
  }
  return url;
}

export async function sendMessage(messages, options = {}) {
  const provider = options.provider || getProvider();
  const model = options.model || getModel();
  const apiKey = getApiKey();
  
  if (!apiKey) {
    throw new Error('AI API key is not configured. Please add your Gemini API key in AI Settings.');
  }

  const endpoint = getEndpoint(provider, model, false);
  const headers = getHeaders(provider);
  const payload = provider === 'gemini' 
    ? buildGeminiPayload(messages, options)
    : buildOpenAIPayload(messages, { ...options, stream: false });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `AI API error: ${response.status}`);
  }

  const data = await response.json();

  if (provider === 'gemini') {
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  }
  return data.choices?.[0]?.message?.content || '';
}

export async function* streamMessage(messages, options = {}) {
  const provider = options.provider || getProvider();
  const model = options.model || getModel();
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('AI API key is not configured.');
  }

  const endpoint = getEndpoint(provider, model, true);
  const headers = getHeaders(provider);
  const payload = provider === 'gemini'
    ? buildGeminiPayload(messages, options)
    : buildOpenAIPayload(messages, { ...options, stream: true });

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || `AI API error: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      
      if (trimmed.startsWith('data: ')) {
        try {
          const json = JSON.parse(trimmed.slice(6));
          let text = '';
          if (provider === 'gemini') {
            text = json.candidates?.[0]?.content?.parts?.[0]?.text || '';
          } else {
            text = json.choices?.[0]?.delta?.content || '';
          }
          if (text) yield text;
        } catch (e) {
          // Skip invalid JSON chunks
        }
      }
    }
  }
}

export const AI_MODELS = {
  gemini: [
    { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', description: 'Ultra-fast and intelligent (Recommended)' },
    { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', description: 'Deep reasoning & balanced' },
    { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', description: 'Latest flagship speed' },
  ],
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o', description: 'Most capable' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast and affordable' },
  ],
};

export function getAvailableModels(provider) {
  return AI_MODELS[provider || getProvider()] || [];
}

export function getCurrentProvider() {
  return getProvider();
}

export function getCurrentModel() {
  return getModel();
}
