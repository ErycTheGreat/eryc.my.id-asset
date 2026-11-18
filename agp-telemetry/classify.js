// Classifies a request by its User-Agent. Pure function: no I/O, easy to test.
//
// LIMIT: User-Agent strings can be spoofed. Every result carries verified:false
// until reverse-DNS / IP-range verification is added (planned, not built yet).
// Use these results for analytics, never for deciding to serve different content.

// Order matters: the first match wins, so list specific names before generic ones.
const BOTS = [
  // AI assistants and AI search
  { name: 'GPTBot', kind: 'ai', re: /GPTBot/i },
  { name: 'OAI-SearchBot', kind: 'ai', re: /OAI-SearchBot/i },
  { name: 'ChatGPT-User', kind: 'ai', re: /ChatGPT-User/i },
  { name: 'ClaudeBot', kind: 'ai', re: /ClaudeBot/i },
  { name: 'Claude-SearchBot', kind: 'ai', re: /Claude-SearchBot/i },
  { name: 'Claude-User', kind: 'ai', re: /Claude-User/i },
  { name: 'Claude-Web', kind: 'ai', re: /Claude-Web/i },
  { name: 'anthropic-ai', kind: 'ai', re: /anthropic-ai/i },
  { name: 'PerplexityBot', kind: 'ai', re: /PerplexityBot/i },
  { name: 'Perplexity-User', kind: 'ai', re: /Perplexity-User/i },
  { name: 'Google-Extended', kind: 'ai', re: /Google-Extended/i },
  { name: 'Gemini-Deep-Research', kind: 'ai', re: /Gemini-Deep-Research/i },
  { name: 'GoogleOther', kind: 'ai', re: /GoogleOther/i },
  { name: 'Google-Agent', kind: 'ai', re: /Google-Agent|GoogleAgent/i },
  { name: 'Bytespider', kind: 'ai', re: /Bytespider/i },
  { name: 'CCBot', kind: 'ai', re: /CCBot/i },
  // Search crawlers
  { name: 'Googlebot', kind: 'crawler', re: /Googlebot/i },
  { name: 'Bingbot', kind: 'crawler', re: /bingbot/i },
  { name: 'Applebot', kind: 'crawler', re: /Applebot/i },
  { name: 'YandexBot', kind: 'crawler', re: /YandexBot/i },
  { name: 'DuckDuckBot', kind: 'crawler', re: /DuckDuckBot/i },
  // Social preview fetchers
  { name: 'FacebookBot', kind: 'social', re: /facebookexternalhit|FacebookBot/i },
  { name: 'Twitterbot', kind: 'social', re: /Twitterbot/i },
  { name: 'LinkedInBot', kind: 'social', re: /LinkedInBot/i },
  { name: 'WhatsApp', kind: 'social', re: /WhatsApp/i },
  { name: 'TelegramBot', kind: 'social', re: /TelegramBot/i },
  { name: 'Discordbot', kind: 'social', re: /Discordbot/i },
];

export function classify(userAgent) {
  const ua = typeof userAgent === 'string' ? userAgent : '';
  for (const bot of BOTS) {
    if (bot.re.test(ua)) {
      return { kind: bot.kind, name: bot.name, verified: false };
    }
  }
  return { kind: 'human', name: 'human', verified: false };
}

export const isBot = (classification) => classification.kind !== 'human';
