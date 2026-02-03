// app/api/feedback/route.ts
import { Resend } from "resend";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY!);

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Input validation schema
const feedbackSchema = z.object({
  email: z.string().email(),
  message: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = feedbackSchema.safeParse(json);

    if (!parsed.success) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, message } = parsed.data;

    // 1️⃣ Send email via Resend
    await resend.emails.send({
      from: "Feedback <feedback@yourdomain.com>",
      to: ["you@yourdomain.com"], // Replace with your email
      subject: "New Feedback Received",
      replyTo: email,
      text: `Feedback from: ${email}\n\n${message}`,
    });

    // 2️⃣ Store in Supabase
    await supabase.from("feedback").insert({
      email,
      message,
    });

    return Response.json({ success: true });
  } catch (err) {
    console.error("Feedback error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
