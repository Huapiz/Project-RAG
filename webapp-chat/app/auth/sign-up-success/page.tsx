import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Mail } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <MessageSquare className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">AI Chat</span>
        </div>

        <Card className="bg-card border-border">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl text-foreground">Check Your Email</CardTitle>
            <CardDescription className="text-muted-foreground">We&apos;ve sent you a confirmation link</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Please check your email and click the confirmation link to activate your account. After confirmation, you
              can log in and start chatting.
            </p>
            <Link href="/auth/login" className="text-primary hover:underline text-sm">
              Back to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
