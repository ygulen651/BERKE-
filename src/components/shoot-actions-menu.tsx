"use client"

import { useState } from "react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { MoreVertical, Pencil, Trash2, Loader2 } from "lucide-react"
import { deleteShoot } from "@/actions/shoot-actions"
import { EditShootDialog } from "./edit-shoot-dialog"
import { useRouter } from "next/navigation"

interface ShootActionsMenuProps {
    shoot: any
    customers: any[]
}

export function ShootActionsMenu({ shoot, customers }: ShootActionsMenuProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (!confirm("Bu çekim kaydını silmek istediğinize emin misiniz?")) return

        setIsDeleting(true)
        const result = await deleteShoot(shoot.id)
        setIsDeleting(false)

        if (result.success) {
            router.refresh() // Takvim dahil tüm sayfaları güncelle
        } else {
            alert("Hata: " + result.error)
        }
    }

    return (
        <div className="flex justify-end gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <MoreVertical className="w-4 h-4" />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={() => setEditOpen(true)}
                    >
                        <Pencil className="w-4 h-4 mr-2" />
                        Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        className="text-red-600 focus:text-red-600 cursor-pointer"
                        onClick={handleDelete}
                    >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Sil
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <EditShootDialog
                shoot={shoot}
                customers={customers}
                open={editOpen}
                onOpenChange={setEditOpen}
            />
        </div>
    )
}
