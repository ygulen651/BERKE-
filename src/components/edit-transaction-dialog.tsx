"use client"

import { useState } from "react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Camera, User } from "lucide-react"
import { updateTransaction } from "@/actions/finance-actions"

const formSchema = z.object({
    amount: z.string().min(1, "Tutar gereklidir"),
    category: z.string().min(1, "Kategori gereklidir"),
    date: z.string().min(1, "Tarih gereklidir"),
    relatedId: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
    title: z.string().min(1, "Başlık gereklidir"),
})

interface EditTransactionDialogProps {
    transaction: any
    open: boolean
    onOpenChange: (open: boolean) => void
    employees: any[]
    shoots: any[]
}

export function EditTransactionDialog({
    transaction,
    open,
    onOpenChange,
    employees,
    shoots
}: EditTransactionDialogProps) {
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: transaction.amount.toString(),
            category: transaction.category || "",
            date: new Date(transaction.date).toISOString().split('T')[0],
            relatedId: transaction.relatedId || "",
            description: transaction.description || "",
            title: transaction.title || "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        const result = await updateTransaction(transaction.id, {
            ...values,
            type: transaction.type, // Keep original type
        })
        setLoading(false)

        if (result.success) {
            onOpenChange(false)
        } else {
            alert("Hata: " + result.error)
        }
    }

    const isIncome = transaction.type === "INCOME"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isIncome ? "Geliri Düzenle" : "Gideri Düzenle"}</DialogTitle>
                    <DialogDescription>
                        Finansal hareket detaylarını güncelleyin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Başlık / Açıklama</label>
                        <Input {...form.register("title")} placeholder="İşlem başlığı" />
                        {form.formState.errors.title && <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>}
                    </div>

                    {isIncome ? (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Gelir Türü</label>
                            <Select
                                onValueChange={(val) => {
                                    form.setValue("category", val)
                                    const categoryMap: Record<string, string> = {
                                        SICAK_CEKIM: "Sıcak Çekim Ücreti",
                                        REZEVASYON: "Rezervasyon Ücreti",
                                        ALBUM_SATIS: "Albüm Satış",
                                        DIGER: "Diğer Gelir"
                                    }
                                    form.setValue("title", categoryMap[val] || form.getValues().title)
                                }}
                                defaultValue={transaction.category}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SICAK_CEKIM">Sıcak Çekim Ücreti</SelectItem>
                                    <SelectItem value="REZEVASYON">Rezervasyon Kaparo</SelectItem>
                                    <SelectItem value="ALBUM_SATIS">Albüm / Ürün Satışı</SelectItem>
                                    <SelectItem value="DIGER">Diğer</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Kategori</label>
                            <Input {...form.register("category")} disabled className="bg-slate-50" />
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            {isIncome ? "İlgili Çekim (Opsiyonel)" : "İlgili Personel"}
                        </label>
                        <Select
                            onValueChange={(val) => form.setValue("relatedId", val)}
                            defaultValue={transaction.relatedId}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder={isIncome ? "Çekim seçin" : "Personel seçin"} />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value=" ">
                                    {isIncome ? "Seçilmedi" : "İlgili Yok"}
                                </SelectItem>
                                {isIncome ? (
                                    shoots.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>
                                            <div className="flex items-center gap-2">
                                                <Camera className="w-3 h-3 text-slate-400" />
                                                <span>{s.customer?.name} - {new Date(s.startDateTime).toLocaleDateString('tr-TR')}</span>
                                            </div>
                                        </SelectItem>
                                    ))
                                ) : (
                                    employees.map((e) => (
                                        <SelectItem key={e.id} value={e.id}>
                                            <div className="flex items-center gap-2">
                                                <User className="w-3 h-3 text-slate-400" />
                                                <span>{e.name}</span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
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
                        <Input {...form.register("description")} placeholder="İlave notlar..." />
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Değişiklikleri Kaydet
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
