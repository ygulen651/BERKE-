"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { CreditCard, TrendingDown, Loader2, Banknote, Building2 } from "lucide-react"
import { recordPayment, updateShootPrice } from "@/actions/shoot-actions"

interface PaymentActionsProps {
    shootId: string
    totalPrice: number
    deposit: number
}

const PAYMENT_METHODS = [
    { id: "Nakit", label: "Nakit", icon: Banknote, color: "bg-green-50 border-green-300 text-green-700" },
    { id: "Kredi Kartı", label: "Kredi Kartı", icon: CreditCard, color: "bg-blue-50 border-blue-300 text-blue-700" },
    { id: "Havale", label: "Havale", icon: Building2, color: "bg-purple-50 border-purple-300 text-purple-700" },
]

export function PaymentActions({ shootId, totalPrice, deposit }: PaymentActionsProps) {
    const [paymentOpen, setPaymentOpen] = useState(false)
    const [priceOpen, setPriceOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Ödeme Al state
    const [paymentAmount, setPaymentAmount] = useState("")
    const [paymentNote, setPaymentNote] = useState("")
    const [paymentMethod, setPaymentMethod] = useState<string | null>(null)

    // Fiyat Düşür state
    const [newPrice, setNewPrice] = useState(totalPrice.toString())

    const remaining = totalPrice - deposit

    async function handlePayment() {
        const amount = parseFloat(paymentAmount)
        if (!amount || amount <= 0) return alert("Geçerli bir tutar girin")
        if (amount > remaining) return alert(`Kalan ödeme tutarından (${remaining.toLocaleString("tr-TR")} ₺) fazla girilemez`)
        if (!paymentMethod) return alert("Lütfen ödeme yöntemi seçin")
        setLoading(true)

        const note = [paymentMethod, paymentNote].filter(Boolean).join(" — ")
        const result = await recordPayment(shootId, amount, note)
        setLoading(false)
        if (result.success) {
            setPaymentOpen(false)
            setPaymentAmount("")
            setPaymentNote("")
            setPaymentMethod(null)
        } else {
            alert("Hata: " + result.error)
        }
    }

    async function handlePriceUpdate() {
        const price = parseFloat(newPrice)
        if (!price || price < 0) return alert("Geçerli bir tutar girin")
        if (price >= totalPrice) return alert("Yeni fiyat mevcut fiyattan düşük olmalıdır")
        setLoading(true)
        const result = await updateShootPrice(shootId, price)
        setLoading(false)
        if (result.success) {
            setPriceOpen(false)
        } else {
            alert("Hata: " + result.error)
        }
    }

    return (
        <>
            {/* Ödeme Al Butonu */}
            <Button
                className="w-full justify-start gap-2"
                variant="outline"
                onClick={() => setPaymentOpen(true)}
                disabled={remaining <= 0}
            >
                <CreditCard className="w-4 h-4" />
                {remaining <= 0 ? "Ödeme Tamamlandı ✓" : "Ödeme Al / Kaydet"}
            </Button>

            {/* Fiyat Düşür Butonu */}
            <Button
                className="w-full justify-start gap-2"
                variant="outline"
                onClick={() => { setNewPrice(totalPrice.toString()); setPriceOpen(true) }}
            >
                <TrendingDown className="w-4 h-4" />
                Fiyatı Güncelle
            </Button>

            {/* Ödeme Al Dialog */}
            <Dialog open={paymentOpen} onOpenChange={setPaymentOpen}>
                <DialogContent className="sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle>Ödeme Al / Kaydet</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">

                        {/* Özet */}
                        <div className="bg-slate-50 rounded-lg p-3 text-sm space-y-1">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Toplam Tutar</span>
                                <span className="font-semibold">{totalPrice.toLocaleString("tr-TR")} ₺</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Alınan Kapora</span>
                                <span className="font-semibold text-green-600">{deposit.toLocaleString("tr-TR")} ₺</span>
                            </div>
                            <div className="flex justify-between border-t pt-1 mt-1">
                                <span className="text-muted-foreground font-medium">Kalan</span>
                                <span className="font-bold text-red-500">{remaining.toLocaleString("tr-TR")} ₺</span>
                            </div>
                        </div>

                        {/* Ödeme Yöntemi */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Ödeme Yöntemi</label>
                            <div className="grid grid-cols-3 gap-2">
                                {PAYMENT_METHODS.map(({ id, label, icon: Icon, color }) => (
                                    <button
                                        key={id}
                                        type="button"
                                        onClick={() => setPaymentMethod(id)}
                                        className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-semibold transition-all ${paymentMethod === id
                                                ? color + " ring-2 ring-offset-1 ring-current"
                                                : "bg-white border-slate-200 text-slate-500 hover:border-slate-300"
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Tutar */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Alınan Tutar (₺)</label>
                            <Input
                                type="number"
                                placeholder={`Maks: ${remaining.toLocaleString("tr-TR")} ₺`}
                                value={paymentAmount}
                                onChange={(e) => setPaymentAmount(e.target.value)}
                                min={1}
                                max={remaining}
                            />
                        </div>

                        {/* Not */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Not (İsteğe Bağlı)</label>
                            <Input
                                placeholder="Ör: Kaparo alındı"
                                value={paymentNote}
                                onChange={(e) => setPaymentNote(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPaymentOpen(false)}>İptal</Button>
                        <Button onClick={handlePayment} disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Kaydet
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Fiyat Güncelle Dialog */}
            <Dialog open={priceOpen} onOpenChange={setPriceOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Fiyatı Güncelle</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="bg-slate-50 rounded-lg p-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Mevcut Fiyat</span>
                                <span className="font-semibold">{totalPrice.toLocaleString("tr-TR")} ₺</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Yeni Fiyat (₺)</label>
                            <Input
                                type="number"
                                placeholder="Yeni fiyatı girin"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                min={0}
                            />
                            <p className="text-xs text-muted-foreground">⚠️ Mevcut fiyattan düşük bir değer girin</p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setPriceOpen(false)}>İptal</Button>
                        <Button onClick={handlePriceUpdate} disabled={loading} variant="destructive">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Fiyatı Düşür
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
