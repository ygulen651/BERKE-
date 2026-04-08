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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Check } from "lucide-react"
import { updateShoot } from "@/actions/shoot-actions"
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
    customerId: z.string().optional().or(z.literal("")),
    companyId: z.string().optional().or(z.literal("")),
    title: z.string().min(2, "Çekim adı/başlığı gereklidir"),
    type: z.string().min(1, "Çekim türü gereklidir"),
    date: z.string().min(1, "Tarih seçilmelidir"),
    startTime: z.string().min(1, "Başlangıç saati gereklidir"),
    endTime: z.string().min(1, "Bitiş saati gereklidir"),
    location: z.string().optional().or(z.literal("")),
    package: z.string().optional().or(z.literal("")),
    totalPrice: z.coerce.number().min(0),
    deposit: z.coerce.number().min(0),
    status: z.string().min(1),
    staffIds: z.array(z.string()).max(5, "En fazla 5 personel seçebilirsiniz"),
}).refine(data => {
    const hasCustomer = data.customerId && data.customerId !== "none" && data.customerId !== ""
    const hasCompany = data.companyId && data.companyId !== "none_company" && data.companyId !== ""
    return hasCustomer || hasCompany
}, {
    message: "Lütfen bir müşteri veya bir firma seçin",
    path: ["customerId"]
})


type FormValues = z.infer<typeof formSchema>

interface EditShootDialogProps {
    shoot: any
    customers: any[]
    companies: any[]
    employees: any[]
    inventory: any[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditShootDialog({ shoot, customers, companies, employees, inventory, open, onOpenChange }: EditShootDialogProps) {
    const [loading, setLoading] = useState(false)
    const [selectedExtras, setSelectedExtras] = useState<string[]>([])
    const router = useRouter()

    const toggleExtra = (id: string) => {
        setSelectedExtras(prev =>
            prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
        )
    }

    const toggleStaff = (id: string) => {
        const currentIds = form.getValues("staffIds") || []
        if (currentIds.includes(id)) {
            form.setValue("staffIds", currentIds.filter(i => i !== id))
        } else if (currentIds.length < 5) {
            form.setValue("staffIds", [...currentIds, id])
        }
    }

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            customerId: shoot.customerId?.toString() || "",
            companyId: shoot.companyId?.toString() || "",
            title: shoot.title || "",
            type: shoot.type || "Düğün",
            date: shoot.startDateTime ? new Date(shoot.startDateTime).toISOString().split('T')[0] : "",
            startTime: shoot.startDateTime ? new Date(shoot.startDateTime).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' }) : "09:00",
            endTime: shoot.endDateTime ? new Date(shoot.endDateTime).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' }) : "10:00",
            location: shoot.location || "",
            package: shoot.package || "",
            totalPrice: shoot.totalPrice || 0,
            deposit: shoot.deposit || 0,
            status: shoot.status || "PLANNED",
            staffIds: shoot.staffIds?.map((id: any) => id.toString()) || [],
        },
    })

    // Reset form when shoot changes
    useEffect(() => {
        if (shoot) {
            form.reset({
                customerId: shoot.customerId?.toString() || "",
                companyId: shoot.companyId?.toString() || "",
                title: shoot.title || "",
                type: shoot.type || "Düğün",
                date: shoot.startDateTime ? new Date(shoot.startDateTime).toISOString().split('T')[0] : "",
                startTime: shoot.startDateTime ? new Date(shoot.startDateTime).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' }) : "09:00",
                endTime: shoot.endDateTime ? new Date(shoot.endDateTime).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' }) : "10:00",
                location: shoot.location || "",
                package: shoot.package || "",
                totalPrice: shoot.totalPrice || 0,
                deposit: shoot.deposit || 0,
                status: shoot.status || "PLANNED",
                staffIds: shoot.staffIds?.map((id: any) => id.toString()) || [],
            })
            setSelectedExtras(shoot.extras || [])
        }
    }, [shoot, form])

    async function onSubmit(values: FormValues) {
        setLoading(true)

        const startDateTime = new Date(`${values.date}T${values.startTime}`)
        const endDateTime = new Date(`${values.date}T${values.endTime}`)

        const result = await updateShoot(shoot.id, {
            customerId: values.customerId,
            companyId: values.companyId || null,
            title: values.title,
            type: values.type,
            startDateTime,
            endDateTime,
            location: values.location,
            package: values.package,
            totalPrice: values.totalPrice,
            deposit: values.deposit,
            status: values.status,
            staffIds: values.staffIds,
            extras: selectedExtras,
        })

        setLoading(false)

        if (result.success) {
            router.refresh()
            onOpenChange(false)
        } else {
            alert("Hata: " + result.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Çekim Kaydını Düzenle</DialogTitle>
                    <DialogDescription>
                        Çekim randevu bilgilerini güncelleyin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Personel Seçimi (Opsiyonel) */}
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium">Görevli Personeller (Maks 5 Kişi)</label>
                            <div className="flex flex-wrap gap-2">
                                {employees.map((e) => {
                                    const isSelected = (form.watch("staffIds") || []).includes(e.id)
                                    return (
                                        <button
                                            key={e.id}
                                            type="button"
                                            onClick={() => toggleStaff(e.id)}
                                            className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${isSelected
                                                ? "bg-blue-600 border-blue-600 text-white"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
                                                }`}
                                        >
                                            {e.name}
                                        </button>
                                    )
                                })}
                            </div>
                            {form.formState.errors.staffIds && (
                                <p className="text-xs text-red-500">{form.formState.errors.staffIds.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className={`text-sm font-medium ${form.watch("companyId") && form.watch("companyId") !== "none_company" ? "opacity-50" : ""}`}>
                                Müşteri Seçin
                            </label>
                            <Select
                                value={form.watch("customerId") || "none"}
                                onValueChange={(val) => {
                                    form.setValue("customerId", val)
                                    if (val !== "none") {
                                        form.setValue("companyId", "none_company")
                                    }
                                }}
                                disabled={!!(form.watch("companyId") && form.watch("companyId") !== "none_company")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Müşteri ara/seç" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">Seçilmedi</SelectItem>
                                    {customers.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.customerId && (
                                <p className="text-[10px] text-red-500 font-medium">{form.formState.errors.customerId.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className={`text-sm font-medium ${form.watch("customerId") && form.watch("customerId") !== "none" ? "opacity-50" : ""}`}>
                                Firma Seçin (Opsiyonel)
                            </label>
                            <Select
                                value={form.watch("companyId") || "none_company"}
                                onValueChange={(val) => {
                                    form.setValue("companyId", val)
                                    if (val !== "none_company") {
                                        form.setValue("customerId", "none")
                                    }
                                }}
                                disabled={!!(form.watch("customerId") && form.watch("customerId") !== "none" && form.watch("customerId") !== "")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Firma ara/seç" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none_company">Firma Yok</SelectItem>
                                    {companies?.map((c) => (
                                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium">Çekim Başlığı / Detayı</label>
                            <Input {...form.register("title")} placeholder="Örn: X Çifti Düğün Çekimi" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Çekim Türü</label>
                            <Select
                                onValueChange={(val) => form.setValue("type", val)}
                                defaultValue={form.getValues("type")}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Düğün">Düğün</SelectItem>
                                    <SelectItem value="Nişan">Nişan</SelectItem>
                                    <SelectItem value="Kına">Kına</SelectItem>
                                    <SelectItem value="Dış Çekim">Dış Çekim</SelectItem>
                                    <SelectItem value="Ürün">Ürün</SelectItem>
                                    <SelectItem value="Konsept">Konsept</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Durum</label>
                            <Select
                                onValueChange={(val) => form.setValue("status", val)}
                                defaultValue={form.getValues("status")}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PLANNED">PLANNED</SelectItem>
                                    <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                                    <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Tarih</label>
                            <Input {...form.register("date")} type="date" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Başlangıç Saati</label>
                            <Input {...form.register("startTime")} type="time" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bitiş Saati</label>
                            <Input {...form.register("endTime")} type="time" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Toplam Ücret (₺)</label>
                            <Input {...form.register("totalPrice")} type="number" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Alınan Kapora (₺)</label>
                            <Input {...form.register("deposit")} type="number" />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium">Konum / Adres (Opsiyonel)</label>
                            <Input {...form.register("location")} placeholder="Örn: Karaman Kalesi" />
                        </div>
                    </div>

                    {/* Paket Seçenekleri */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Paket İçeriği & Ürünler</label>
                        <div className="grid grid-cols-2 gap-2">
                            {/* Statik Ekstralar */}
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

                            {/* Dinamik Stoklar (Envanter) */}
                            {inventory.map((item) => {
                                const isSelected = selectedExtras.includes(item.id)
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => toggleExtra(item.id)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all text-left ${isSelected
                                            ? "bg-emerald-600 text-white border-emerald-700"
                                            : "bg-emerald-50/50 border-emerald-100 text-emerald-700 hover:border-emerald-200 hover:bg-emerald-50"
                                            }`}
                                    >
                                        <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${isSelected ? "bg-white/20 border-white/40" : "border-emerald-300"
                                            }`}>
                                            {isSelected && <Check className="w-3 h-3" />}
                                        </span>
                                        <span className="truncate">{item.name}</span>
                                        <span className="text-[10px] opacity-70 ml-auto flex-shrink-0">Stok: {item.quantity}</span>
                                    </button>
                                )
                            })}
                        </div>
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
