import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"

export async function POST(request: NextRequest) {
  try {
    const { question } = await request.json()

    if (!question || question.trim() === "") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 })
    }

    const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || "http://localhost:5678/webhook/test"

    console.log("[API] Sending question to n8n:", question)
    console.log("[API] Webhook URL:", n8nWebhookUrl)

    // Send to n8n webhook
    const response = await axios.post(
      n8nWebhookUrl,
      {
        question: question,
        timestamp: new Date().toISOString(),
      },
      {
        timeout: 30000,
      },
    )

    console.log("[API] Response from n8n:", response.data)

    return NextResponse.json({
      success: true,
      data: response.data,
      message: "Question processed successfully",
    })
  } catch (error: any) {
    console.error("[API] Error:", error.message)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to process question",
        details: error.response?.data || null,
      },
      { status: 500 },
    )
  }
}
