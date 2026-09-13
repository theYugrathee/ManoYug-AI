import { z } from "zod";

export const chatMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z
    .string()
    .trim()
    .min(1, "Message cannot be empty")
    .max(800, "Message exceeds the 800 character maximum limit"),
  language: z.enum(["en", "hi", "hinglish"]).optional().default("en"),
});

export const checkinSchema = z.object({
  period: z.enum(["daily", "weekly"]).default("daily"),
  mood: z.coerce.number().int().min(1).max(5),
  stress: z.coerce.number().int().min(1).max(5),
  energy: z.coerce.number().int().min(1).max(5),
  sleep: z.coerce.number().int().min(1).max(5),
  academicPressure: z.coerce.number().int().min(1).max(5),
  socialConnection: z.coerce.number().int().min(1).max(5),
  note: z.string().trim().max(500).optional(),
});

export const supportRequestSchema = z.object({
  note: z.string().trim().min(1).max(1000),
});

export const rosterRowSchema = z
  .object({
    email: z.string().trim().email("A valid student email is required"),
    phone: z.string().trim().optional().or(z.literal("")),
    name: z.string().trim().optional().or(z.literal("")),
    university_roll_no: z.string().trim().optional().or(z.literal("")),
    graduation_year: z.coerce.number().int().optional(),
    department: z.string().trim().optional().or(z.literal("")),
    programme: z.string().trim().optional().or(z.literal("")),
    batch: z.string().trim().optional().or(z.literal("")),
    status: z.enum(["ACTIVE", "INACTIVE", "PENDING"]).optional().default("ACTIVE"),
  })
  .refine((data) => Boolean(data.email), {
    message: "Student email is required",
    path: ["email"],
  });

export const manualStudentEntrySchema = z
  .object({
    entryType: z.enum(["email", "phone", "both"]).default("email"),
    email: z.string().trim().optional().or(z.literal("")),
    phone: z.string().trim().optional().or(z.literal("")),
    name: z.string().trim().max(120).optional().or(z.literal("")),
    universityRollNo: z.string().trim().max(64).optional().or(z.literal("")),
    department: z.string().trim().max(100).optional().or(z.literal("")),
    graduationYear: z.coerce.number().int().optional(),
  })
  .refine(
    (data) => {
      if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return false;
      if (data.phone && data.phone.replace(/\D/g, "").length < 10) return false;
      return true;
    },
    {
      message: "Please enter a valid student email address. Phone number is optional.",
      path: ["email"],
    },
  );
