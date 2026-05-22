"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Loader2 } from "lucide-react"
import { deleteCariRecord } from "@/actions/cari-actions"
import { useRouter } from "next/navigation"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteCariButtonProps {
    id: string
}

export function DeleteCariButton({ id }: DeleteCariButtonProps) {
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const router = useRouter()

    async function handleDelete() {
        setLoading(true)
        const result = await deleteCariRecord(id)
        setLoading(false)
        setOpen(false)
        if (result.success) {
            router.refresh()
        } else {
            alert("Silme hatası: " + result.error)
        }
    }

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                    <Trash2 className="w-4 h-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="font-bold">Kaydı Silmek İstediğinize Emin Misiniz?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Bu cari işlem kaydı kalıcı olarak silinecektir. Bu işlem geri alınamaz.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>Vazgeç</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700 text-white gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Siliniyor...
                            </>
                        ) : (
                            "Evet, Sil"
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
