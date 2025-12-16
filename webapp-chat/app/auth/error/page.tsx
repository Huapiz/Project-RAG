import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, AlertCircle } from "lucide-react"
import Link from "next/link"

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error: string }>
}) {
  const params = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <MessageSquare className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">AI Chat</span>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl text-foreground">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">{params?.error || "An error occurred during authentication."}</p>
            <Link href="/auth/login" className="text-primary hover:underline text-sm">
              Try Again
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
