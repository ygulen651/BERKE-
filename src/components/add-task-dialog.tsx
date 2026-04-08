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
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ListPlus, Loader2 } from "lucide-react"
import { createTask } from "@/actions/task-actions"

const formSchema = z.object({
    title: z.string().min(2, "Görev başlığı gereklidir"),
    type: z.enum(["Çekim", "Klip", "Albüm", "Genel"]),
    description: z.string().optional().or(z.literal("")),
    assignedTo: z.string().min(1, "Personel seçimi gereklidir"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
    deadline: z.string().optional().or(z.literal("")),
})

interface AddTaskDialogProps {
    employees: any[]
}

export function AddTaskDialog({ employees }: AddTaskDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            type: "Genel",
            description: "",
            assignedTo: "",
            priority: "MEDIUM",
            deadline: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setLoading(true)
        // placeholder admin ID for now, in real app this comes from session
        const adminId = employees.find(e => e.role === "ADMIN")?.id || employees[0]?.id

        const result = await createTask({
            ...values,
            deadline: values.deadline ? new Date(values.deadline) : undefined,
            createdBy: adminId,
        })
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
                    <ListPlus className="w-4 h-4" />
                    Yeni Görev Ata
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Yeni Görev Ata</DialogTitle>
                    <DialogDescription>
                        Ekip üyelerine yapılması gereken işleri atayın.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                    <div className="flex gap-4">
                        <div className="space-y-2 flex-grow">
                            <label className="text-sm font-medium">Görev Başlığı</label>
                            <Input {...form.register("title")} placeholder="Örn: Albüm tasarımı" />
                        </div>
                        <div className="space-y-2 w-[120px]">
                            <label className="text-sm font-medium">Tür</label>
                            <Select onValueChange={(val) => form.setValue("type", val as any)} defaultValue="Genel">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Genel">Genel</SelectItem>
                                    <SelectItem value="Çekim">Çekim</SelectItem>
                                    <SelectItem value="Klip">Klip</SelectItem>
                                    <SelectItem value="Albüm">Albüm</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {form.formState.errors.title && <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Atanacak Personel</label>
                        <Select onValueChange={(val) => form.setValue("assignedTo", val)}>
                            <SelectTrigger>
                                <SelectValue placeholder="Personel seçin" />
                            </SelectTrigger>
                            <SelectContent>
                                {employees.map((e) => (
                                    <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.assignedTo && <p className="text-xs text-red-500">{form.formState.errors.assignedTo.message}</p>}
                    </div>
                    <div className="flex gap-4">
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium">Öncelik</label>
                            <Select onValueChange={(val) => form.setValue("priority", val as any)} defaultValue="MEDIUM">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Düşük</SelectItem>
                                    <SelectItem value="MEDIUM">Orta</SelectItem>
                                    <SelectItem value="HIGH">Yüksek</SelectItem>
                                    <SelectItem value="URGENT">Acil</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2 flex-1">
                            <label className="text-sm font-medium">Bitiş Tarihi</label>
                            <Input {...form.register("deadline")} type="date" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Personel Ne Yapacak?</label>
                        <Textarea
                            {...form.register("description")}
                            placeholder="Yapılması gereken işin detayları ve talimatlar..."
                            className="min-h-[100px]"
                        />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Görevi Ata
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
