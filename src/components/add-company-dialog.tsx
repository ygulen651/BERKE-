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
import { Building2, Loader2 } from "lucide-react"
import { createCompany } from "@/actions/company-actions"
import { useRouter } from "next/navigation"

const formSchema = z.object({
    name: z.string().min(2, "Firma adı en az 2 karakter olmalıdır"),
    representative: z.string().min(2, "Yetkili ismi en az 2 karakter olmalıdır"),
    phone: z.string().optional().or(z.literal("")),
    email: z.string().email("Geçerli bir e-posta adresi giriniz").optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
})

export function AddCompanyDialog() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            representative: "",
            phone: "",
            email: "",
            address: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        const result = await createCompany(values)
        setLoading(false)

        if (result.success) {
            setOpen(false)
            form.reset()
            router.refresh()
        } else {
            alert("Hata: " + result.error)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <Building2 className="w-4 h-4" />
                    Yeni Firma Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Yeni Firma Ekle</DialogTitle>
                    <DialogDescription>
                        Kurumsal müşterilerinizi yönetmek için yeni bir firma kaydı oluşturun.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Firma Adı</label>
                        <Input {...form.register("name")} placeholder="Örn: X Holding" />
                        {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Yetkili Kişi</label>
                        <Input {...form.register("representative")} placeholder="Örn: Ahmet Bey" />
                        {form.formState.errors.representative && <p className="text-xs text-red-500">{form.formState.errors.representative.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Telefon</label>
                        <Input {...form.register("phone")} placeholder="05xx ..." />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">E-posta (Opsiyonel)</label>
                        <Input {...form.register("email")} type="email" placeholder="iletisim@firma.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Adres (Opsiyonel)</label>
                        <Input {...form.register("address")} placeholder="Firma adresi..." />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Firmayı Kaydet
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
