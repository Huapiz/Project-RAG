import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { message, conversationId, userId } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Get n8n webhook URL from environment variable
    const webhookUrl = process.env.N8N_WEBHOOK_URL

    if (!webhookUrl) {
      // Return a fallback response if webhook is not configured
      return NextResponse.json({
        response:
          "The n8n webhook is not configured. Please set the N8N_WEBHOOK_URL environment variable to connect to your n8n workflow.",
      })
    }

    // Call n8n webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        conversationId,
        userId,
        timestamp: new Date().toISOString(),
      }),
    })

    if (!webhookResponse.ok) {
      throw new Error(`Webhook responded with status: ${webhookResponse.status}`)
    }

    const data = await webhookResponse.json()

    // n8n can return response in different formats, handle common ones
    const responseText =
      data.response ||
      data.output ||
      data.message ||
      data.text ||
      (typeof data === "string" ? data : JSON.stringify(data))

    return NextResponse.json({ response: responseText })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      {
        response:
          "Sorry, there was an error connecting to the AI service. Please check your n8n webhook configuration.",
      },
      { status: 500 },
    )
  }
}
