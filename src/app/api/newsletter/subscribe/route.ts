import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : ""

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json({ success: false, error: "Please enter a valid email." }, { status: 400 })
    }

    if (process.env.RESEND_API_KEY) {
      await subscribeWithResend(normalizedEmail)
      return NextResponse.json({ success: true })
    }

    if (process.env.SENDGRID_API_KEY) {
      await subscribeWithSendGrid(normalizedEmail)
      return NextResponse.json({ success: true })
    }

    return NextResponse.json(
      { success: false, error: "Newsletter email provider is not configured." },
      { status: 503 }
    )
  } catch (error) {
    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      { success: false, error: "Could not subscribe right now." },
      { status: 500 }
    )
  }
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

async function subscribeWithResend(email: string) {
  const from = process.env.NEWSLETTER_FROM_EMAIL
  const to = process.env.NEWSLETTER_TO_EMAIL || process.env.CONTACT_EMAIL

  if (!from || !to) {
    throw new Error("Resend requires NEWSLETTER_FROM_EMAIL and NEWSLETTER_TO_EMAIL.")
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: "New YiiArt newsletter signup",
      text: `New newsletter signup: ${email}`,
    }),
  })

  if (!response.ok) {
    throw new Error("Resend subscription notification failed.")
  }
}

async function subscribeWithSendGrid(email: string) {
  const from = process.env.NEWSLETTER_FROM_EMAIL
  const to = process.env.NEWSLETTER_TO_EMAIL || process.env.CONTACT_EMAIL

  if (!from || !to) {
    throw new Error("SendGrid requires NEWSLETTER_FROM_EMAIL and NEWSLETTER_TO_EMAIL.")
  }

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from },
      subject: "New YiiArt newsletter signup",
      content: [{ type: "text/plain", value: `New newsletter signup: ${email}` }],
    }),
  })

  if (!response.ok) {
    throw new Error("SendGrid subscription notification failed.")
  }
}
