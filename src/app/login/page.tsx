"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Camera, Lock, Mail, Loader2, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [name, setName] = useState("")
    const [rememberMe, setRememberMe] = useState(false)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    // Load remembered email
    useEffect(() => {
        const savedEmail = localStorage.getItem("rememberedEmail")
        if (savedEmail) {
            setEmail(savedEmail)
            setRememberMe(true)
        }
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError(null)
        setSuccessMessage(null)

        try {
            if (isLogin) {
                // Save email if remember me is checked
                if (rememberMe) {
                    localStorage.setItem("rememberedEmail", email)
                } else {
                    localStorage.removeItem("rememberedEmail")
                }

                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                })

                if (result?.error) {
                    setError("Giriş başarısız. Lütfen bilgilerinizi kontrol edin.")
                } else {
                    router.push("/dashboard")
                    router.refresh()
                }
            } else {
                // Registration Logic
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name, email, password }),
                })

                const data = await res.json()

                if (!res.ok) {
                    throw new Error(data.message || "Kayıt oluşturulamadı.")
                }

                setSuccessMessage("Kayıt başarılı! Şimdi giriş yapabilirsiniz.")
                setIsLogin(true)
                setPassword("")
            }
        } catch (err: any) {
            setError(err.message || "Bir hata oluştu. Lütfen tekrar deneyin.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950">
            {/* Background Image with Blur */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/login_background.png"
                    alt="Background"
                    fill
                    className="object-cover opacity-60 scale-105 blur-[2px]"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-transparent to-slate-950/80" />
            </div>

            {/* Animated Circles for extra depth */}
            <div className="absolute top-1/4 -left-20 w-80 h-80 bg-blue-500/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] animate-pulse delay-700" />

            <div className="relative z-10 w-full max-w-2xl px-4 flex flex-col items-center gap-12">
                {/* Huge Logo - The Star of the Show */}
                <div className="relative w-full max-w-[700px] h-[450px] transform hover:scale-105 transition-transform duration-1000 cursor-default drop-shadow-[0_0_50px_rgba(255,255,255,0.4)]">
                    <Image
                        src="/YENİ LOGO SİYAH PNG.png"
                        alt="Berke Günaydın Logo"
                        fill
                        className="object-contain invert brightness-0"
                        priority
                    />
                </div>

                {/* Minimalist Login Form - Appears subtly */}
                <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500 fill-mode-both">
                    {successMessage && (
                        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-lg animate-in fade-in slide-in-from-top-1 duration-300">
                            <p className="text-sm font-medium">{successMessage}</p>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg animate-in fade-in slide-in-from-top-1 duration-300">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            {!isLogin && (
                                <div className="relative group animate-in slide-in-from-left-2 fade-in duration-300">
                                    <Input
                                        type="text"
                                        placeholder="İsim Soyisim"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required={!isLogin}
                                        className="pl-4 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all text-base rounded-full"
                                    />
                                </div>
                            )}
                            <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
                                <Input
                                    type="email"
                                    placeholder="E-posta"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    autoComplete="email"
                                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all text-base rounded-full"
                                />
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-white transition-colors" />
                                <Input
                                    type="password"
                                    placeholder="Şifre"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    className="pl-10 h-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:ring-1 focus:ring-white/20 focus:border-white/20 transition-all text-base rounded-full"
                                />
                            </div>
                        </div>

                        {isLogin && (
                            <div className="flex items-center justify-between px-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div
                                        onClick={() => setRememberMe(!rememberMe)}
                                        className={`w-5 h-5 rounded border transition-all flex items-center justify-center ${rememberMe ? 'bg-white border-white' : 'border-white/20 bg-white/5 group-hover:border-white/40'}`}
                                    >
                                        {rememberMe && <CheckCircle2 className="w-3.5 h-3.5 text-black" />}
                                    </div>
                                    <span className="text-sm text-slate-400 group-hover:text-white transition-colors">Beni Hatırla</span>
                                </label>
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full h-12 bg-white text-black hover:bg-slate-200 font-bold rounded-full transition-all active:scale-95 disabled:opacity-70 group"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <span className="flex items-center gap-2">
                                    {isLogin ? "Giriş" : "Kayıt Ol"}
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </span>
                            )}
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsLogin(!isLogin)
                                    setError(null)
                                    setSuccessMessage(null)
                                }}
                                className="text-sm text-slate-500 hover:text-white transition-colors underline-offset-4 hover:underline"
                            >
                                {isLogin ? "Hesabın yok mu? Kayıt Ol" : "Zaten hesabın var mı? Giriş Yap"}
                            </button>
                        </div>
                    </form>

                    <div className="pt-8 text-center border-t border-white/5 w-full mt-4">
                        <Link
                            href="https://www.yusufgulenmedya.com.tr/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-black text-white hover:text-blue-400 transition-colors tracking-wide"
                        >
                            Yusuf Gülen Medya Tarafından Yapılmıştır
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                body {
                    background: #020617;
                }
            `}</style>
        </div>
    )
}
