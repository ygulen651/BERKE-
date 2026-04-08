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
import { UserPlus, Loader2 } from "lucide-react"
import { createCustomer } from "@/actions/customer-actions"

const formSchema = z.object({
    name: z.string().min(2, "İsim en az 2 karakter olmalıdır"),
    email: z.string().email("Geçerli bir e-posta adresi giriniz").optional().or(z.literal("")),
    phone: z.string().min(10, "Telefon numarası eksik").optional().or(z.literal("")),
    socialMedia: z.string().optional().or(z.literal("")),
    notes: z.string().optional().or(z.literal("")),
})

export function AddCustomerDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            socialMedia: "",
            notes: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        const result = await createCustomer(values)
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
                    Yeni Müşteri Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Yeni Müşteri Ekle</DialogTitle>
                    <DialogDescription>
                        Müşteri portföyünüze yeni bir kişi ekleyin.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Tam İsim</label>
                        <Input {...form.register("name")} placeholder="Örn: Mehmet Yılmaz" />
                        {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Telefon</label>
                        <Input {...form.register("phone")} placeholder="05xx ..." />
                        {form.formState.errors.phone && <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">E-posta (Opsiyonel)</label>
                        <Input {...form.register("email")} type="email" placeholder="örn: mehmet@gmail.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Sosyal Medya (Opsiyonel)</label>
                        <Input {...form.register("socialMedia")} placeholder="@instagram_kullanici" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notlar</label>
                        <Input {...form.register("notes")} placeholder="Özel talepler, notlar..." />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Müşteriyi Kaydet
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
