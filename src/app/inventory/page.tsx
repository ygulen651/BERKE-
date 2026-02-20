"use server"

import { getInventory, seedDefaultInventory } from "@/actions/inventory-actions"
import { InventoryList } from "@/components/inventory-list"
import { AddInventoryDialog } from "@/components/add-inventory-dialog"
import { Package } from "lucide-react"

export default async function InventoryPage() {
    // İlk girişte varsayılanları oluştur (eğer yoksa)
    await seedDefaultInventory()

    const inventory = await getInventory()

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                        <Package className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Stok Yönetimi</h2>
                        <p className="text-muted-foreground">Çerçeve ve kağıt envanterini anlık olarak takip edin.</p>
                    </div>
                </div>
                <AddInventoryDialog />
            </div>

            <InventoryList items={inventory} />
        </div>
    )
}
