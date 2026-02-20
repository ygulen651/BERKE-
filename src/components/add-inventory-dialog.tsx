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
import { PlusCircle, Loader2 } from "lucide-react"
import { createInventoryItem } from "@/actions/inventory-actions"

const formSchema = z.object({
    name: z.string().min(2, "Ürün adı en az 2 karakter olmalıdır"),
    type: z.enum(["FRAME", "PAPER"]),
    size: z.string().min(1, "Boyut bilgisi gereklidir"),
    quantity: z.coerce.number().min(0, "Miktar 0'dan az olamaz"),
})

type FormValues = z.infer<typeof formSchema>

export function AddInventoryDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            name: "",
            type: "FRAME",
            size: "",
            quantity: 0,
        },
    })

    async function onSubmit(values: FormValues) {
        setLoading(true)
        const result = await createInventoryItem(values)
        if (result.success) {
            setOpen(false)
            form.reset()
        } else {
            alert("Ürün eklenirken bir hata oluştu: " + result.error)
        }
        setLoading(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Yeni Ürün Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Yeni Stok Kalemi Ekle</DialogTitle>
                    <DialogDescription>
                        Envantere yeni bir çerçeve veya kağıt türü ekleyin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Kategori</label>
                        <Select
                            onValueChange={(val) => form.setValue("type", val as any)}
                            defaultValue={form.getValues("type")}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Kategori seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FRAME">Çerçeve</SelectItem>
                                <SelectItem value="PAPER">Kağıt</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Ürün Adı</label>
                        <Input placeholder="Örn: 10x15 Çerçeve" {...form.register("name")} />
                        {form.formState.errors.name && (
                            <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Boyut</label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {["10x15", "15x21", "20x30", "30x40", "Plastik 15x21"].map((s) => (
                                <Button
                                    key={s}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={`h-7 px-2 text-xs ${form.watch("size") === s ? "bg-primary text-primary-foreground border-primary" : ""}`}
                                    onClick={() => form.setValue("size", s)}
                                >
                                    {s}
                                </Button>
                            ))}
                        </div>
                        <Input placeholder="Veya manuel girin: 25x35" {...form.register("size")} />
                        {form.formState.errors.size && (
                            <p className="text-xs text-red-500">{form.formState.errors.size.message}</p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Mevcut Stok</label>
                        <Input type="number" {...form.register("quantity")} />
                        {form.formState.errors.quantity && (
                            <p className="text-xs text-red-500">{form.formState.errors.quantity.message}</p>
                        )}
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {loading ? "Ekleniyor..." : "Kaydet ve Ekle"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
