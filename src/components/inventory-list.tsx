"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Plus,
    Minus,
    Trash2,
    Package,
    Box,
    FileText,
    RefreshCw
} from "lucide-react"
import { updateInventoryQuantity, deleteInventoryItem } from "@/actions/inventory-actions"

export function InventoryList({ items }: { items: any[] }) {
    const [loading, setLoading] = useState<string | null>(null)

    const handleUpdateQuantity = async (id: string, amount: number) => {
        setLoading(id)
        const result = await updateInventoryQuantity(id, amount)
        if (result.success) {
            // Başarılı (Opsiyonel: alert eklenebilir ama miktar zaten güncellendiği için sessizce devam edebilir)
        } else {
            alert("Stok güncellenirken hata oluştu")
        }
        setLoading(null)
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Bu stok kalemini silmek istediğinize emin misiniz?")) return
        setLoading(id)
        const result = await deleteInventoryItem(id)
        if (result.success) {
            // Başarılı
        } else {
            alert("Silme işlemi sırasında hata oluştu")
        }
        setLoading(null)
    }

    const frames = items.filter(item => item.type === "FRAME")
    const papers = items.filter(item => item.type === "PAPER")

    const renderSection = (title: string, data: any[], icon: any) => (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-slate-700">
                {icon} {title}
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.length === 0 ? (
                    <div className="col-span-full py-8 text-center border-2 border-dashed rounded-xl text-muted-foreground">
                        Henüz bu kategoride ürün bulunmuyor.
                    </div>
                ) : (
                    data.map((item) => (
                        <Card key={item.id} className="hover:shadow-md transition-shadow group">
                            <CardHeader className="pb-2 flex flex-row items-center justify-between">
                                <CardTitle className="text-sm font-bold">{item.name}</CardTitle>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => handleDelete(item.id)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <p className="text-3xl font-bold tracking-tight">{item.quantity}</p>
                                        <p className="text-xs text-muted-foreground uppercase">Mevcut Stok</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleUpdateQuantity(item.id, -1)}
                                            disabled={loading === item.id || item.quantity <= 0}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => handleUpdateQuantity(item.id, 1)}
                                            disabled={loading === item.id}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )

    return (
        <div className="space-y-12">
            {renderSection("Çerçeveler", frames, <Box className="w-5 h-5 text-blue-600" />)}
            {renderSection("Kağıtlar", papers, <FileText className="w-5 h-5 text-emerald-600" />)}
        </div>
    )
}
