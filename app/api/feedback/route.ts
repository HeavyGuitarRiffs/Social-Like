// app/api/feedback/route.ts
import { Resend } from "resend";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

// Input validation schema
const feedbackSchema = z.object({
  email: z.string().email(),
  message: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    // Initialize inside the handler (NOT at the top level)
    const resend = new Resend(process.env.RESEND_API_KEY || "");

    const supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_KEY || ""
    );

    const json = await req.json();
    const parsed = feedbackSchema.safeParse(json);

    if (!parsed.success) {
      return Response.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, message } = parsed.data;

    // Send email via Resend
    await resend.emails.send({
      from: "Feedback <feedback@yourdomain.com>",
      to: ["you@yourdomain.com"],
      subject: "New Feedback Received",
      replyTo: email,
      text: `Feedback from: ${email}\n\n${message}`,
    });

    // Store in Supabase
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