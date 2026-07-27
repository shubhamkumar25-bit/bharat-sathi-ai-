import { z } from "zod";
import { searchJobs } from "../services/jobService.js";
import {
  generateGeminiResponse,
  generateResumeAssist,
} from "../services/geminiService.js";

const geminiSchema = z.object({
  prompt: z.string().min(1),
  language: z.string().optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string(),
      })
    )
    .default([]),
  task: z.string().optional(),
});

export async function generateChatReply(req, res, next) {
  try {
    const payload = geminiSchema.parse(req.body);

    const answer = await generateGeminiResponse({
      prompt: payload.prompt,
      history: payload.history,
      systemInstruction:
        "You are BharatSaathi AI, a helpful, intelligent assistant for Indian users. Respond in the same language as the user.",
    });

    res.json({ answer });
  } catch (error) {
    next(error);
  }
}

export async function generateTaskOutput(req, res, next) {
  try {
    const payload = geminiSchema.parse(req.body);

    // Job Search
    if (payload.task === "Job Search") {
      let searchParams = {};
      try {
        searchParams = JSON.parse(payload.prompt);
      } catch {
        searchParams = { skills: payload.prompt, language: payload.language || "English" };
      }

      const result = await searchJobs(searchParams);

      return res.json({
        answer: JSON.stringify(result),
      });
    }

    // Other AI Tasks
    const answer = await generateResumeAssist({
      prompt: payload.prompt,
      history: payload.history,
      systemInstruction: payload.task
        ? `You are BharatSaathi AI. Task: ${payload.task}`
        : undefined,
    });

    res.json({ answer });
  } catch (error) {
    next(error);
  }
}