﻿import axios from 'axios';

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';

const callGroq = async (prompt) => {
  const response = await axios.post(GROQ_API, {
    model: 'llama-3.1-8b-instant',
    messages: [
      { role: 'system', content: 'You are a code reviewer. You must respond with ONLY valid JSON. No markdown, no asterisks, no explanations, no code blocks. Just raw JSON.' },
      { role: 'user', content: prompt }
    ],
    temperature: 0.1,
    max_tokens: 1000,
    response_format: { type: 'json_object' }
  }, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
  });
  const text = response.data.choices[0].message.content.trim();
  return JSON.parse(text);
};

export const reviewFileDiff = async (filename, diff) => {
  const prompt = `Review this code diff for file: ${filename}\n\nDiff:\n${diff.slice(0, 2000)}\n\nReturn JSON with these exact keys: summary (string), bugs (array of strings), suggestions (array of strings), security (array of strings), positives (array of strings), score (object with quality, security, performance, readability as integers 1-10)`;
  return await callGroq(prompt);
};

export const reviewOverall = async (prTitle, prDescription, fileReviews) => {
  const summary = fileReviews.map(f => `File: ${f.name}\nSummary: ${f.aiReview?.summary || ''}`).join('\n\n');
  const prompt = `Overall PR review for: ${prTitle}\n\n${summary}\n\nReturn JSON with these exact keys: overallSummary (string), mainConcerns (array of strings), recommendation (string: APPROVE or REQUEST_CHANGES or NEEDS_DISCUSSION), recommendationReason (string), overallScore (object with quality, security, performance, readability as integers 1-10)`;
  return await callGroq(prompt);
};