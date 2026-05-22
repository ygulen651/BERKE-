"use client"

import { useState } from "react"
import {
    MoreHorizontal,
    Pencil,
    Trash2,
    Loader2
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { deleteCariRecord } from "@/actions/cari-actions"
import { EditCariDialog } from "./edit-cari-dialog"
import { useRouter } from "next/navigation"

interface CariActionsMenuProps {
    record: any
    companies: any[]
}

export function CariActionsMenu({ record, companies }: CariActionsMenuProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        setIsDeleting(true)
        const result = await deleteCariRecord(record.id)
        setIsDeleting(false)
        if (result.success) {
            setIsDeleteDialogOpen(false)
            router.refresh()
        } else {
            alert("Silme hatası: " + result.error)
        }
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-full">
                        <span className="sr-only">Menü aç</span>
                        <MoreHorizontal className="h-4 w-4 text-slate-500" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[160px]">
                    <DropdownMenuItem
                        onClick={() => setIsEditDialogOpen(true)}
                        className="cursor-pointer"
                    >
                        <Pencil className="mr-2 h-4 w-4 text-slate-500" />
                        Düzenle
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="cursor-pointer text-red-650 focus:text-red-600 focus:bg-red-50"
                    >
                        <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                        Sil
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Edit Dialog */}
            {isEditDialogOpen && (
                <EditCariDialog
                    record={record}
                    open={isEditDialogOpen}
                    onOpenChange={setIsEditDialogOpen}
                    companies={companies}
                />
            )}

            {/* Delete Confirmation */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="font-bold">Cari Kaydı Sil</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu cari hesap kaydını silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e: React.MouseEvent) => {
                                e.preventDefault()
                                handleDelete()
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                            disabled={isDeleting}
                        >
                            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
