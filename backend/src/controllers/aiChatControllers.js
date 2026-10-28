import { streamText, tool, convertToModelMessages, stepCountIs } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';
import Job from '../models/jobs.js';
import { escapeRegex } from '../utils/validators.js';
import dotenv from 'dotenv';
dotenv.config();


const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const handleChatBot = async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid request payload.' });
  }

  // Abuse protection: limit message history and individual message size
  if (messages.length > 20) {
    return res.status(400).json({ error: 'Too many messages in conversation history (maximum 20).' });
  }

  for (const msg of messages) {
    const text = typeof msg.content === 'string' ? msg.content : (msg.parts && msg.parts[0]?.text) || '';
    if (typeof text === 'string' && text.length > 2000) {
      return res.status(400).json({ error: 'Message exceeds maximum length of 2000 characters.' });
    }
  }

  try {
    const uiMessages = messages.map((msg) => ({
      ...msg,
      id: msg.id || Math.random().toString(36).substring(7),
      parts: msg.parts || [{ type: 'text', text: msg.content || '' }],
    }));

    const modelMessages = await convertToModelMessages(uiMessages);

    const result = streamText({
      model: google('gemini-2.5-flash'),
      messages: modelMessages,
      // FACT: Explicitly separating the "data lookup" and "response generation" phases.
      system: `You are the JobOne Assistant. 
               1. When the user asks for jobs, call 'searchJobs'. 
               2. The tool will give you job data. 
               3. DO NOT output the raw data. Read it, understand it, and write a friendly, helpful text response to the user summarizing the top results.`,
      tools: {
        searchJobs: tool({
          description: 'Search for jobs.',
          parameters: z.object({
            keyword: z.string().describe('The job keyword.'),
          }),
          execute: async ({ keyword }) => {
            const safeKeyword = escapeRegex((keyword || 'React').trim().slice(0, 50));
            try {
              const jobs = await Job.find({
                status: 'active',
                $or: [
                  { title: { $regex: safeKeyword, $options: 'i' } },
                  { skillsRequired: { $regex: safeKeyword, $options: 'i' } },
                  { industry: { $regex: safeKeyword, $options: 'i' } },
                ],
              }).limit(3).lean(); // Reduced to 3 to keep the context clean

              // Truncate descriptions so the AI doesn't get overwhelmed
              return jobs.map((job) => ({
                title: job.title,
                company: job.postedByCompany,
                description: (job.jobSummary || job.description || "").substring(0, 100) + "...",
                mode: job.mode
              }));
            } catch (err) {
              return { error: 'Database error' };
            }
          },
        }),
      },
      stopWhen: stepCountIs(5),
    });

    // ── NATIVE VERCEL AI SDK STREAMING ───────────────────────────
    console.log('[Chatbot] Pipping data stream to Express response...');
    
    // This strictly adheres to the Data Stream Protocol expected by useChat on frontend
    result.pipeDataStreamToResponse(res);
    
    console.log('[Chatbot] Stream successfully connected and active.');

  } catch (error) {
    console.error('[Chatbot Error] An error occurred in the pipeline:', error.message || error);
    if (error.cause) {
      console.error('[Chatbot Error Cause]:', error.cause);
    }
    
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to process chat' });
    }
  }
};