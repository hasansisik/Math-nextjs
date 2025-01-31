"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { email as configEmail, password as configPassword } from "@/config"

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log(email, password)
    
    if (email === configEmail && password === configPassword) {
      // Create token with expiration
      const token = {
        email,
        exp: new Date().getTime() + 24 * 60 * 60 * 1000 // 24 hours from now
      }
      
      // Store token in cookie
      document.cookie = `auth_token=${JSON.stringify(token)}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`
      
      toast.success("Giriş başarılı!")
      router.push("/dashboard")
    } else {
      toast.error("E-posta veya parola hatalı!")
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Giriş</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Giriş yapmak için e-posta adresinizi girin
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">E-posta</Label>
          <Input 
            id="email" 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="etkinmatematik@gmail.com" 
            required 
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Parola</Label>
          </div>
          <Input 
            id="password" 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} 
            required 
          />
        </div>
        <Button type="submit" className="w-full">
          Giriş
        </Button>
      </div> 
    </form>
  )
}
