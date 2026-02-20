import { getShoots } from "@/actions/shoot-actions"
import { getCustomers } from "@/actions/customer-actions"
import { getEmployees } from "@/actions/employee-actions"
import { getInventory } from "@/actions/inventory-actions"
import { AddShootDialog } from "@/components/add-shoot-dialog"
import { CalendarClient } from "@/components/calendar-client"

export default async function CalendarPage() {
    const shoots = await getShoots()
    const customers = await getCustomers()
    const employees = await getEmployees()
    const inventory = await getInventory()

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Çekim Takvimi</h2>
                    <p className="text-muted-foreground">Tüm randevuları ve çekim planlarını buradan yönetin.</p>
                </div>
                <AddShootDialog customers={customers} employees={employees} inventory={inventory} />
            </div>

            <CalendarClient initialEvents={shoots} />
        </div>
    )
}
