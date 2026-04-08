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
import { UserPlus, Loader2 } from "lucide-react"
import { createEmployee } from "@/actions/employee-actions"

const formSchema = z.object({
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
    email: z.string().email("Geçerli bir e-posta adresi giriniz"),
    phone: z.string().min(10, "Telefon numarası eksik"),
    role: z.enum(["ADMIN", "EMPLOYEE"]),
    position: z.string().min(2, "Pozisyon bilgisi gereklidir"),
})

export function AddEmployeeDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            role: "EMPLOYEE",
            position: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        const result = await createEmployee(values)
        setLoading(false)

        if (result.success) {
            setOpen(false)
            form.reset()
        } else {
            alert("Hata: " + result.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Yeni Personel
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Yeni Personel Ekle</DialogTitle>
                    <DialogDescription>
                        Stüdyo ekibine yeni bir personel ekleyin. Geçici şifre otomatik oluşturulacaktır.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tam İsim</label>
                        <Input {...form.register("name")} placeholder="Örn: Ali Yılmaz" />
                        {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">E-posta</label>
                        <Input {...form.register("email")} type="email" placeholder="örn: ali@studio.com" />
                        {form.formState.errors.email && <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Telefon</label>
                        <Input {...form.register("phone")} placeholder="05xx ..." />
                        {form.formState.errors.phone && <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Pozisyon</label>
                        <Input {...form.register("position")} placeholder="Örn: Fotoğrafçı, Editör" />
                        {form.formState.errors.position && <p className="text-xs text-red-500">{form.formState.errors.position.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Yetki Rolü</label>
                        <Select onValueChange={(val) => form.setValue("role", val as any)} defaultValue="EMPLOYEE">
                            <SelectTrigger>
                                <SelectValue placeholder="Rol seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EMPLOYEE">Personel</SelectItem>
                                <SelectItem value="ADMIN">Yönetici (Full Yetki)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Personeli Kaydet
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
