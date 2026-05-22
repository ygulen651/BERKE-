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
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { updateCariRecord } from "@/actions/cari-actions"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    date: z.string().min(1, "Tarih seçilmelidir"),
    shoots: z.string().min(2, "Çekim bilgisi/başlığı en az 2 karakter olmalıdır"),
    totalAmount: z.coerce.number().min(0, "Toplam tutar 0'dan küçük olamaz"),
    paidAmount: z.coerce.number().min(0, "Ödenen tutar 0'dan küçük olamaz"),
    description: z.string().optional(),
    companyId: z.string().optional().or(z.literal("")),
    companyName: z.string().optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

interface EditCariDialogProps {
    record: any
    companies: any[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditCariDialog({ record, companies, open, onOpenChange }: EditCariDialogProps) {
    const [loading, setLoading] = useState(false)
    const [previewDayMonth, setPreviewDayMonth] = useState("")
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            date: record.date || "",
            shoots: record.shoots || "",
            totalAmount: record.totalAmount || 0,
            paidAmount: record.paidAmount || 0,
            description: record.description || "",
            companyId: record.companyId || "",
            companyName: record.companyName || "",
        },
    })

    // Watch date to show computed Turkish Month & Day preview
    const watchedDate = form.watch("date")

    useEffect(() => {
        if (watchedDate) {
            try {
                const [year, month, day] = watchedDate.split("-").map(Number)
                const date = new Date(year, month - 1, day)
                const monthName = date.toLocaleDateString("tr-TR", { month: "long" })
                const dayName = date.toLocaleDateString("tr-TR", { weekday: "long" })
                setPreviewDayMonth(`${monthName}, ${dayName}`)
            } catch (e) {
                setPreviewDayMonth("")
            }
        } else {
            setPreviewDayMonth("")
        }
    }, [watchedDate])

    // Live calculations for remaining amount
    const watchedTotal = form.watch("totalAmount") || 0
    const watchedPaid = form.watch("paidAmount") || 0
    const remainingAmount = Math.max(0, Number(watchedTotal) - Number(watchedPaid))

    async function onSubmit(values: FormValues) {
        setLoading(true)
        try {
            const result = await updateCariRecord(record.id, {
                date: values.date,
                shoots: values.shoots,
                totalAmount: values.totalAmount,
                paidAmount: values.paidAmount,
                description: values.description,
                companyId: values.companyId || null,
                companyName: values.companyName || null,
            })

            if (result.success) {
                router.refresh()
                onOpenChange(false)
            } else {
                alert("Hata: " + result.error)
            }
        } catch (error: any) {
            console.error("Cari update error:", error)
            alert("Güncelleme sırasında bir hata oluştu: " + (error?.message || error))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">Cari Kaydı Düzenle</DialogTitle>
                    <DialogDescription>
                        Cari hesap ödeme durumunu ve çekim bilgilerini güncelleyin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Tarih</label>
                        <div className="flex items-center gap-3">
                            <Input
                                type="date"
                                {...form.register("date")}
                                className="flex-1"
                            />
                            {previewDayMonth && (
                                <div className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-lg text-xs font-bold text-blue-700 whitespace-nowrap animate-pulse">
                                    {previewDayMonth}
                                </div>
                            )}
                        </div>
                        {form.formState.errors.date && (
                            <p className="text-xs text-red-500">{form.formState.errors.date.message}</p>
                        )}
                    </div>

                    {/* Company Selection Buttons */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Firma Seçin (İsteğe Bağlı)</label>
                        <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto p-1 border rounded-lg bg-slate-50/50">
                            <button
                                type="button"
                                onClick={() => {
                                    form.setValue("companyId", "")
                                    form.setValue("companyName", "")
                                }}
                                className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                                    !form.watch("companyId")
                                        ? "bg-slate-900 border-slate-900 text-white shadow-sm"
                                        : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                }`}
                            >
                                Bireysel (Firma Yok)
                            </button>
                            {companies?.map((company) => {
                                const isSelected = form.watch("companyId") === company.id
                                return (
                                    <button
                                        key={company.id}
                                        type="button"
                                        onClick={() => {
                                            form.setValue("companyId", company.id)
                                            form.setValue("companyName", company.name)
                                        }}
                                        className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                                            isSelected
                                                ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                        }`}
                                    >
                                        {company.name}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Çekimler</label>
                        <Input
                            placeholder="Örn: Dış çekim albüm teslimatı, stüdyo portre..."
                            {...form.register("shoots")}
                        />
                        {form.formState.errors.shoots && (
                            <p className="text-xs text-red-500">{form.formState.errors.shoots.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Toplam Tutar (₺)</label>
                            <Input
                                type="number"
                                step="any"
                                placeholder="0.00"
                                {...form.register("totalAmount")}
                            />
                            {form.formState.errors.totalAmount && (
                                <p className="text-xs text-red-500">{form.formState.errors.totalAmount.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Ödenen Tutar (₺)</label>
                            <Input
                                type="number"
                                step="any"
                                placeholder="0.00"
                                {...form.register("paidAmount")}
                            />
                            {form.formState.errors.paidAmount && (
                                <p className="text-xs text-red-500">{form.formState.errors.paidAmount.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Calculated Remaining Amount */}
                    <div className="p-3 bg-slate-50 border rounded-lg flex justify-between items-center text-sm shadow-inner">
                        <span className="font-semibold text-slate-600">Kalan Ödeme Tutarı:</span>
                        <span className={`font-bold text-base px-2.5 py-0.5 rounded-md ${
                            remainingAmount > 0 
                                ? "text-rose-600 bg-rose-50 border border-rose-100" 
                                : "text-emerald-600 bg-emerald-50 border border-emerald-100"
                        }`}>
                            {new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(remainingAmount)}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">Açıklama (İsteğe Bağlı)</label>
                        <Textarea
                            placeholder="Ek detay veya notlar..."
                            {...form.register("description")}
                            rows={2}
                        />
                        {form.formState.errors.description && (
                            <p className="text-xs text-red-500">{form.formState.errors.description.message}</p>
                        )}
                    </div>

                    <DialogFooter className="pt-4 border-t">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                            disabled={loading}
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Güncelleniyor...
                                </>
                            ) : (
                                "Güncelle"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
