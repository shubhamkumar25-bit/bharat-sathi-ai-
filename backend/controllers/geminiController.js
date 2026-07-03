
import { z } from "zod";
import { searchJobs } from "../services/jobService.js";
import {
  generateGeminiResponse,
  generateResumeAssist,
} from "../services/geminiService.js";

const geminiSchema = z.object({
  prompt: z.string().min(1),
  language: z.enum(["hi", "en"]).default("hi"),
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
        "You are BharatSaathi AI. Always answer in simple Hindi. Provide practical solutions for Indian students, job seekers, farmers, and workers.",
    });

    res.json({ answer });
  } catch (error) {
    next(error);
  }
}

export async function generateTaskOutput(req, res, next) {
  try {
    const payload = geminiSchema.parse(req.body);

    // Real Job Search
    if (payload.task === "Job Search") {
      const jobs = await searchJobs(payload.prompt);

      return res.json({
        answer: JSON.stringify({
          jobs,
        }),
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