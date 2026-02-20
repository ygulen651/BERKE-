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
import { PlusCircle, Loader2, Camera, Package, Trash2, ShoppingCart } from "lucide-react"
import { createTransaction } from "@/actions/finance-actions"
import { updateInventoryQuantity } from "@/actions/inventory-actions"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    amount: z.string().min(1, "Tutar gereklidir"),
    category: z.enum(["SICAK_CEKIM", "REZEVASYON", "ALBUM_SATIS", "DIGER"]),
    date: z.string().min(1, "Tarih gereklidir"),
    relatedId: z.string().optional().or(z.literal("")),
    description: z.string().optional().or(z.literal("")),
})

interface AddIncomeDialogProps {
    shoots: any[]
    inventory: any[]
}

interface SelectedStockItem {
    inventoryId: string
    name: string
    quantity: number
}

export function AddIncomeDialog({ shoots, inventory }: AddIncomeDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const [selectedStockItems, setSelectedStockItems] = useState<SelectedStockItem[]>([])
    const [currentInventoryId, setCurrentInventoryId] = useState("")
    const [currentQuantity, setCurrentQuantity] = useState("1")
    const router = useRouter()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            amount: "",
            category: "SICAK_CEKIM",
            date: new Date().toISOString().split('T')[0],
            relatedId: "",
            description: "",
        },
    })

    const addStockItem = () => {
        if (!currentInventoryId) return
        const item = inventory.find(i => i.id === currentInventoryId)
        if (!item) return

        const existingIndex = selectedStockItems.findIndex(i => i.inventoryId === currentInventoryId)
        if (existingIndex > -1) {
            const newItems = [...selectedStockItems]
            newItems[existingIndex].quantity += parseInt(currentQuantity)
            setSelectedStockItems(newItems)
        } else {
            setSelectedStockItems([...selectedStockItems, {
                inventoryId: currentInventoryId,
                name: item.name,
                quantity: parseInt(currentQuantity)
            }])
        }
        setCurrentInventoryId("")
        setCurrentQuantity("1")
    }

    const removeStockItem = (index: number) => {
        setSelectedStockItems(selectedStockItems.filter((_, i) => i !== index))
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        const categoryMap: Record<string, string> = {
            SICAK_CEKIM: "Sıcak Çekim Ücreti",
            REZEVASYON: "Rezervasyon Ücreti",
            ALBUM_SATIS: "Albüm Satış",
            DIGER: "Diğer Gelir"
        }

        // 1. İşlemi kaydet
        const result = await createTransaction({
            ...values,
            type: "INCOME",
            title: categoryMap[values.category],
            stockItems: selectedStockItems // Opsiyonel: İşlem detayına eklenebilir
        })

        if (result.success) {
            // 2. Stoklardan düş
            for (const item of selectedStockItems) {
                await updateInventoryQuantity(item.inventoryId, -item.quantity)
            }

            router.refresh()
            setOpen(false)
            form.reset()
            setSelectedStockItems([])
        } else {
            alert("Hata: " + result.error)
        }
        setLoading(false)
    }

    if (!isMounted) {
        return (
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 opacity-50" disabled>
                <PlusCircle className="w-4 h-4" />
                Sıcak Çekim Ücretleri
            </Button>
        )
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <PlusCircle className="w-4 h-4" />
                    Sıcak Çekim Ücretleri
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Sıcak Çekim Kaydet</DialogTitle>
                    <DialogDescription>
                        Stüdyo için elde edilen gelir bilgisini ve satılan ürünleri girin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Gelir Türü</label>
                        <Select
                            onValueChange={(val) => form.setValue("category", val as any)}
                            defaultValue={form.getValues("category")}
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

                    {/* Ürün Seçimi (Sadece Sıcak Çekim veya Ürün Satışı için) */}
                    {(form.watch("category") === "SICAK_CEKIM" || form.watch("category") === "ALBUM_SATIS") && (
                        <div className="p-3 border rounded-lg bg-slate-50/50 space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-1">
                                <Package className="w-4 h-4" />
                                <span>Kullanılan Ürünler / Stoklar</span>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Select onValueChange={setCurrentInventoryId} value={currentInventoryId}>
                                        <SelectTrigger className="bg-white">
                                            <SelectValue placeholder="Ürün seçin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {inventory.map((item) => (
                                                <SelectItem key={item.id} value={item.id}>
                                                    {item.name} ({item.quantity} adet)
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-20">
                                    <Input
                                        type="number"
                                        min="1"
                                        value={currentQuantity}
                                        onChange={(e) => setCurrentQuantity(e.target.value)}
                                        className="bg-white"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={addStockItem}
                                    disabled={!currentInventoryId}
                                    className="bg-white"
                                >
                                    Ekle
                                </Button>
                            </div>

                            {/* Seçilen Ürün Listesi */}
                            {selectedStockItems.length > 0 && (
                                <div className="space-y-2 pt-1">
                                    {selectedStockItems.map((item, index) => (
                                        <div key={index} className="flex items-center justify-between text-xs bg-white p-2 rounded border border-slate-200">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-700">{item.name}</span>
                                                <span className="text-slate-400">x</span>
                                                <span className="font-bold text-blue-600 font-mono">{item.quantity}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeStockItem(index)}
                                                className="text-red-400 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">İlgili Çekim (Opsiyonel)</label>
                        <Select onValueChange={(val) => form.setValue("relatedId", val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Çekim seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value=" ">Seçilmedi</SelectItem>
                                {shoots.map((s) => (
                                    <SelectItem key={s.id} value={s.id}>
                                        <div className="flex items-center gap-2">
                                            <Camera className="w-3 h-3 text-slate-400" />
                                            <span>{s.customer?.name} - {new Date(s.startDateTime).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    </SelectItem>
                                ))}
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
                        <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Sıcak Çekim Kaydet
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
