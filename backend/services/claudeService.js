import axios from 'axios';
import Anthropic from '@anthropic-ai/sdk';

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';

export function cleanAndParseJSON(text) {
  if (!text) throw new Error('Empty response from AI review model');
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  }
  return JSON.parse(cleaned);
}

export const callClaude = async (prompt) => {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022',
    max_tokens: 1500,
    temperature: 0.1,
    system: 'You are an expert code reviewer. You must respond with ONLY valid JSON without markdown wrapping or commentary. Return raw valid JSON.',
    messages: [
      { role: 'user', content: prompt }
    ]
  });

  const contentBlock = response.content?.[0];
  const text = contentBlock?.text || '';
  return cleanAndParseJSON(text);
};

export const callGroq = async (prompt) => {
  const response = await axios.post(GROQ_API, {
    model: process.env.GROQ_MODEL || 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: 'You are a code reviewer. You must respond with ONLY valid JSON. No markdown, no asterisks, no explanations, no code blocks. Just raw JSON.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 1500,
    response_format: { type: 'json_object' }
  }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    timeout: 30000
  });

  const text = response.data.choices[0].message.content;
  return cleanAndParseJSON(text);
};

export const callAI = async (prompt) => {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await callClaude(prompt);
    } catch (err) {
      if (process.env.GROQ_API_KEY) {
        console.warn('⚠️ Anthropic call failed, falling back to Groq:', err.message);
        return await callGroq(prompt);
      }
      throw err;
    }
  }

  if (process.env.GROQ_API_KEY) {
    return await callGroq(prompt);
  }

  throw new Error('No AI provider configured. Set ANTHROPIC_API_KEY or GROQ_API_KEY in backend/.env.');
};

export const reviewFileDiff = async (filename, diff) => {
  const prompt = `Review this code diff for file: ${filename}\n\nDiff:\n${(diff || '').slice(0, 3000)}\n\nReturn JSON with these exact keys: summary (string), bugs (array of strings), suggestions (array of strings), security (array of strings), positives (array of strings), score (object with quality, security, performance, readability as integers 1-10)`;
  return await callAI(prompt);
};

export const reviewOverall = async (prTitle, prDescription, fileReviews) => {
  const summary = fileReviews.map(f => `File: ${f.name}\nSummary: ${f.aiReview?.summary || ''}`).join('\n\n');
  const prompt = `Overall PR review for: ${prTitle}\n\nDescription:\n${(prDescription || '').slice(0, 1000)}\n\nFiles reviewed:\n${summary}\n\nReturn JSON with these exact keys: overallSummary (string), mainConcerns (array of strings), recommendation (string: APPROVE or REQUEST_CHANGES or NEEDS_DISCUSSION), recommendationReason (string), overallScore (object with quality, security, performance, readability as integers 1-10)`;
  return await callAI(prompt);
};
