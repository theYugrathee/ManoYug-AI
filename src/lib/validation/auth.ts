import { z } from "zod";

const currentYear = new Date().getFullYear();

/** Indian mobile: optional +91 / 0, then 10 digits starting 6–9 */
const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/[\s-]/g, ""))
  .refine(
    (v) => /^(?:\+91|91|0)?[6-9]\d{9}$/.test(v),
    "Enter a valid Indian mobile number",
  );

const passwordSchema = z
  .string()
  .min(6, "Password must be at least 6 characters");

export const registerStudentSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(120, "Name is too long"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address")
    .max(254),
  phone: phoneSchema,
  graduationYear: z.coerce
    .number()
    .int("Graduation year must be a whole number")
    .min(currentYear - 1, "Graduation year looks too old")
    .max(currentYear + 8, "Graduation year looks too far ahead"),
  universityRollNo: z
    .string()
    .trim()
    .max(64, "Roll number is too long")
    .regex(/^[A-Za-z0-9][A-Za-z0-9/_.-]*$/, "Roll number contains invalid characters")
    .optional()
    .or(z.literal("")),
  instituteCode: z
    .string()
    .trim()
    .min(3, "Enter your College / University Code")
    .max(40, "Institute code is too long")
    .regex(/^[A-Za-z0-9-]+$/, "Institute code can only contain letters, numbers, and hyphens")
    .transform((v) => v.toUpperCase()),
  password: passwordSchema,
});

export type RegisterStudentInput = z.infer<typeof registerStudentSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  password: z.string().min(1, "Enter your password"),
  instituteCode: z
    .string()
    .trim()
    .min(3, "Enter your College / University Code")
    .max(40, "Institute code is too long")
    .regex(/^[A-Za-z0-9-]+$/, "Institute code can only contain letters, numbers, and hyphens")
    .transform((v) => v.toUpperCase())
    .optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const instituteLoginSchema = z.object({
  instituteCode: z
    .string()
    .trim()
    .min(1, "Enter your Institute Code")
    .regex(/^[A-Za-z0-9-]+$/, "Institute code can only contain letters, numbers, and hyphens")
    .transform((v) => v.toUpperCase()),
  password: z.string().min(1, "Enter your password"),
});

export type InstituteLoginInput = z.infer<typeof instituteLoginSchema>;

export const createInstituteSchema = z.object({
  name: z.string().trim().min(3, "Enter the institution name").max(200),
  institutionType: z.string().trim().min(2, "Enter the institution type"),
  city: z.string().trim().min(2, "Enter city"),
  state: z.string().trim().min(2, "Enter state"),
  code: z
    .string()
    .trim()
    .min(4, "Institute code must be at least 4 characters")
    .max(30)
    .regex(/^[A-Za-z0-9-]+$/, "Institute code can only contain alphanumeric characters and hyphens")
    .transform((v) => v.toUpperCase()),
  adminEmail: z.string().trim().toLowerCase().email("Enter a valid admin email"),
  password: passwordSchema,
  studentCapacity: z.coerce.number().int().min(50).max(500000).default(5000),
  phone: z.string().trim().optional(),
  website: z.string().trim().optional(),
});

export type CreateInstituteInput = z.infer<typeof createInstituteSchema>;

export const verifyOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  token: z
    .string()
    .trim()
    .regex(/^\d{6,8}$/, "Enter the verification code from your email"),
});

export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;

export const resendOtpSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export type ResendOtpInput = z.infer<typeof resendOtpSchema>;

export function flattenZodErrors(
  error: z.ZodError,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === "string" && !out[key]) {
      out[key] = issue.message;
    }
  }
  return out;
}
