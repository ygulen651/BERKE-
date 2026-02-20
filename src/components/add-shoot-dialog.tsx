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
import { Camera, Loader2, PlusCircle, Check } from "lucide-react"
import { createShoot } from "@/actions/shoot-actions"
import { useRouter } from "next/navigation"

const EXTRAS = [
    { id: "album_25x70", label: "25x70 Albüm Kutu" },
    { id: "cerceve", label: "Çerçeve" },
    { id: "kanvas", label: "Kanvas" },
    { id: "ask_kitabi", label: "Aşk Kitabı" },
    { id: "klip", label: "Klip" },
    { id: "fotograf", label: "Fotoğraf" },
    { id: "gelin_alma", label: "Gelin Alma" },
    { id: "dis_cekim_dis", label: "Dış Çekim (Dışarı)" },
    { id: "dis_cekim_studyo", label: "Dış Çekim (Stüdyo)" },
    { id: "acilis_klibi", label: "Açılış Klibi" },
    { id: "klibi", label: "Düğün Hikayesi" },
    { id: "drone", label: "Drone Çekim" },
    { id: "aktuel", label: "Aktüel" },
    { id: "kamera", label: "Kamera" },
]

const formSchema = z.object({
    customerId: z.string().min(1, "Müşteri seçimi gereklidir"),
    title: z.string().min(2, "Çekim adı/başlığı gereklidir"),
    type: z.string().min(1, "Çekim türü gereklidir"),
    date: z.string().min(1, "Tarih seçilmelidir"),
    startTime: z.string().min(1, "Başlangıç saati gereklidir"),
    endTime: z.string().min(1, "Bitiş saati gereklidir"),
    phone: z.string().optional().or(z.literal("")),
    location: z.string().optional().or(z.literal("")),
    package: z.string().optional().or(z.literal("")),
    totalPrice: z.coerce.number().min(0),
    deposit: z.coerce.number().min(0),
})

type FormValues = z.infer<typeof formSchema>

interface AddShootDialogProps {
    customers: any[]
}

export function AddShootDialog({ customers }: AddShootDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [selectedExtras, setSelectedExtras] = useState<string[]>([])
    const router = useRouter()

    const toggleExtra = (id: string) => {
        setSelectedExtras(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        )
    }

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            customerId: "",
            title: "",
            type: "Düğün",
            date: "",
            startTime: "09:00",
            endTime: "10:00",
            phone: "",
            location: "",
            package: "",
            totalPrice: 0,
            deposit: 0,
        },
    })

    async function onSubmit(values: FormValues) {
        setLoading(true)

        const startDateTime = new Date(`${values.date}T${values.startTime}`)
        const endDateTime = new Date(`${values.date}T${values.endTime}`)

        const result = await createShoot({
            customerId: values.customerId,
            title: values.title,
            type: values.type,
            startDateTime,
            endDateTime,
            phone: values.phone,
            location: values.location,
            package: values.package,
            totalPrice: values.totalPrice,
            deposit: values.deposit,
            extras: selectedExtras,
        })

        setLoading(false)

        if (result.success) {
            router.refresh()
            setOpen(false)
            form.reset()
            setSelectedExtras([])
        } else {
            alert("Hata: " + result.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <PlusCircle className="w-4 h-4" />
                    Yeni Randevu / Çekim
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Yeni Çekim Kaydı Oluştur</DialogTitle>
                    <DialogDescription>
                        Takvime yeni bir çekim randevusu ekleyin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Müşteri */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium">Müşteri Seçin</label>
                            <Select onValueChange={(val) => form.setValue("customerId", val)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Müşteri ara/seç" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.length === 0 ? (
                                        <SelectItem value="none" disabled>Müşteri kaydı yok</SelectItem>
                                    ) : (
                                        customers.map((c) => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Başlık */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium">Çekim Başlığı / Detayı</label>
                            <Input {...form.register("title")} placeholder="Örn: X Çifti Düğün Çekimi" />
                        </div>

                        {/* Telefon */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium">Telefon Numarası</label>
                            <Input {...form.register("phone")} type="tel" placeholder="Örn: 0530 123 45 67" />
                        </div>

                        {/* Tür & Tarih */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Çekim Türü</label>
                            <Select onValueChange={(val) => form.setValue("type", val)} defaultValue="Düğün">
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Düğün">Düğün</SelectItem>
                                    <SelectItem value="Nişan">Nişan</SelectItem>
                                    <SelectItem value="Dış Çekim">Dış Çekim</SelectItem>
                                    <SelectItem value="Ürün">Ürün</SelectItem>
                                    <SelectItem value="Konsept">Konsept</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tarih</label>
                            <Input {...form.register("date")} type="date" />
                        </div>

                        {/* Saatler */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Başlangıç Saati</label>
                            <Input {...form.register("startTime")} type="time" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bitiş Saati</label>
                            <Input {...form.register("endTime")} type="time" />
                        </div>

                        {/* Fiyat */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Toplam Ücret (₺)</label>
                            <Input {...form.register("totalPrice")} type="number" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Alınan Kapora (₺)</label>
                            <Input {...form.register("deposit")} type="number" />
                        </div>

                        {/* Konum */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium">Konum / Adres (Opsiyonel)</label>
                            <Input {...form.register("location")} placeholder="Örn: Karaman Kalesi" />
                        </div>
                    </div>

                    {/* Paket Seçenekleri */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Paket İçeriği (İsteğe Bağlı)</label>
                        <div className="grid grid-cols-2 gap-2">
                            {EXTRAS.map((extra) => {
                                const isSelected = selectedExtras.includes(extra.id)
                                return (
                                    <button
                                        key={extra.id}
                                        type="button"
                                        onClick={() => toggleExtra(extra.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all text-left ${isSelected
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                                            }`}
                                    >
                                        <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${isSelected ? "bg-white/20 border-white/40" : "border-slate-300"
                                            }`}>
                                            {isSelected && <Check className="w-3 h-3" />}
                                        </span>
                                        {extra.label}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Randevuyu Kaydet
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
