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
import { Loader2 } from "lucide-react"
import { updateShoot } from "@/actions/shoot-actions"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    customerId: z.string().min(1, "Müşteri seçimi gereklidir"),
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
    staffId: z.string().optional().or(z.literal("")),
})

type FormValues = z.infer<typeof formSchema>

interface EditShootDialogProps {
    shoot: any
    customers: any[]
    employees: any[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditShootDialog({ shoot, customers, employees, open, onOpenChange }: EditShootDialogProps) {
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema) as any,
        defaultValues: {
            customerId: shoot.customerId?.toString() || "",
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
            staffId: shoot.staffId?.toString() || "",
        },
    })

    // Reset form when shoot changes
    useEffect(() => {
        if (shoot) {
            form.reset({
                customerId: shoot.customerId?.toString() || "",
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
                staffId: shoot.staffId?.toString() || "",
            })
        }
    }, [shoot, form])

    async function onSubmit(values: FormValues) {
        setLoading(true)

        const startDateTime = new Date(`${values.date}T${values.startTime}`)
        const endDateTime = new Date(`${values.date}T${values.endTime}`)

        const result = await updateShoot(shoot.id, {
            customerId: values.customerId,
            title: values.title,
            type: values.type,
            startDateTime,
            endDateTime,
            location: values.location,
            package: values.package,
            totalPrice: values.totalPrice,
            deposit: values.deposit,
            status: values.status,
            staffId: values.staffId,
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
            <DialogContent className="sm:max-w-[500px]">
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
                            <label className="text-sm font-medium">Görevli Personel</label>
                            <Select
                                onValueChange={(val) => form.setValue("staffId", val)}
                                defaultValue={form.getValues("staffId")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Personel seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map((e) => (
                                        <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-sm font-medium">Müşteri Seçin</label>
                            <Select
                                onValueChange={(val) => form.setValue("customerId", val)}
                                defaultValue={form.getValues("customerId")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Müşteri ara/seç" />
                                </SelectTrigger>
                                <SelectContent>
                                    {customers.map((c) => (
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
