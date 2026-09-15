/**
 * Safe user-facing auth copy — never reveal internal eligibility records or institution names.
 */
export const AUTH_SAFE_MESSAGES = {
  registrationAccepted:
    "Your eligibility was verified and your account is ready. Continue to your student space.",
  registrationValidation: "Please correct the highlighted fields and try again.",
  authNotConfigured:
    "Sign-in is unavailable until the authentication service is configured. Ask your platform administrator to set Supabase environment variables.",
  loginFailed: "Email or password is incorrect.",
  loginGeneric: "We could not sign you in. Try again in a moment.",
  otpInvalid:
    "That code is invalid or expired. Request a new code and try again.",
  otpResent:
    "If an account exists for that email, a new verification code was sent.",
  eligibilityUnconfirmed:
    "Your email is verified. We could not confirm an active institutional eligibility record for the details provided. Contact your institution support office for help.",
  eligibilityLinked:
    "Your account is verified and linked to your institution. You can continue to your student space.",
  accountExistsSafe:
    "If an account already exists for this email, sign in instead.",
  rateLimited: "Too many attempts. Wait a few minutes and try again.",
} as const;

export type AuthActionResult =
  | {
      ok: true;
      code: string;
      message: string;
      redirectTo?: string;
    }
  | {
      ok: false;
      code: string;
      message: string;
      fieldErrors?: Record<string, string>;
    };
