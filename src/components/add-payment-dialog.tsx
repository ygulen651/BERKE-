"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { WalletCards, Loader2 } from "lucide-react"
import { createTransaction } from "@/actions/finance-actions"

const formSchema = z.object({
    amount: z.string().min(1, "Tutar gereklidir"),
    relatedIds: z.array(z.string()).min(1, "En az bir personel seçilmelidir"),
    shootId: z.string().optional().or(z.literal("")),
    date: z.string().min(1, "Tarih gereklidir"),
    description: z.string().optional().or(z.literal("")),
})

interface AddPaymentDialogProps {
    employees: any[]
    shoots: any[]
    transactions: any[]
}

export function AddPaymentDialog({ employees, shoots, transactions }: AddPaymentDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: "",
            relatedIds: [],
            shootId: "",
            date: new Date().toISOString().split('T')[0],
            description: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        const result = await createTransaction({
            ...values,
            type: "EXPENSE",
            category: "PERSONNEL_PAYMENT",
            title: "Personel Ödemesi",
        })
        setLoading(false)

        if (result.success) {
            setOpen(false)
            form.reset()
        } else {
            alert("Hata: " + result.error)
        }
    }

    if (!isMounted) {
        return (
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 opacity-50" disabled>
                <WalletCards className="w-4 h-4" />
                Personel Ödemesi Yap
            </Button>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                    <WalletCards className="w-4 h-4" />
                    Personel Ödemesi Yap
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Personel Ödemesi Kaydet</DialogTitle>
                    <DialogDescription>
                        Personele yapılan ödeme bilgilerini girin. Bu işlem gider olarak kaydedilecektir.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">İlgili Çekim (Opsiyonel)</label>
                        <Select onValueChange={(val) => form.setValue("shootId", val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Çekim seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">Seçilmedi</SelectItem>
                                {shoots.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.customer?.name} - {s.title}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ödeme Yapılacak Personeller</label>
                        <div className="flex flex-wrap gap-2 p-3 border rounded-lg bg-slate-50/50">
                            {(() => {
                                const selectedShootId = form.watch("shootId")
                                const selectedShoot = shoots.find(s => s.id === selectedShootId)
                                const assignedStaffIds = selectedShoot?.staffIds?.map((id: any) => id.toString()) || []

                                const filteredEmployees = selectedShootId && selectedShootId !== "none"
                                    ? employees.filter(e => assignedStaffIds.includes(e.id))
                                    : employees;

                                if (filteredEmployees.length === 0) {
                                    return <p className="text-xs text-muted-foreground w-full text-center py-2">Uygun personel bulunamadı</p>
                                }

                                return filteredEmployees.map((e) => {
                                    const isSelected = form.watch("relatedIds").includes(e.id)
                                    const isAssigned = assignedStaffIds.includes(e.id)

                                    // Ödeme durumunu kontrol et
                                    let paymentStatus = null;
                                    if (isAssigned && selectedShootId && selectedShootId !== "none") {
                                        const hasPayment = transactions.some(t =>
                                            t.type === "EXPENSE" &&
                                            t.category === "PERSONNEL_PAYMENT" &&
                                            t.relatedId?.toString() === e.id &&
                                            t.shootId?.toString() === selectedShootId
                                        );
                                        paymentStatus = hasPayment ? "Ödendi" : "Bekliyor";
                                    }

                                    return (
                                        <button
                                            key={e.id}
                                            type="button"
                                            onClick={() => {
                                                const current = form.getValues("relatedIds")
                                                if (isSelected) {
                                                    form.setValue("relatedIds", current.filter(id => id !== e.id))
                                                } else {
                                                    form.setValue("relatedIds", [...current, e.id])
                                                }
                                            }}
                                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all flex items-center gap-1.5 ${isSelected
                                                ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                                }`}
                                        >
                                            {e.name}
                                            {paymentStatus === "Ödendi" && (
                                                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-emerald-500"}`} />
                                            )}
                                            {paymentStatus === "Bekliyor" && (
                                                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-white" : "bg-red-500 animate-pulse"}`} />
                                            )}
                                        </button>
                                    )
                                })
                            })()}
                        </div>
                        {form.formState.errors.relatedIds && (
                            <p className="text-xs text-red-500">{form.formState.errors.relatedIds.message}</p>
                        )}
                    </div>
                    <div className="flex gap-4">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium">Tutar (₺)</label>
                            <Input {...form.register("amount")} type="number" step="0.01" placeholder="0.00" />
                            {form.formState.errors.amount && <p className="text-xs text-red-500">{form.formState.errors.amount.message}</p>}
                        </div>
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium">Tarih</label>
                            <Input {...form.register("date")} type="date" />
                            {form.formState.errors.date && <p className="text-xs text-red-500">{form.formState.errors.date.message}</p>}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Not / Açıklama</label>
                        <Input {...form.register("description")} placeholder="Maaş, avans vb." />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Ödemeyi Kaydet
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
