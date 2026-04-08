import { getEmployees } from "@/actions/employee-actions"
import { AddEmployeeDialog } from "@/components/add-employee-dialog"
import { EmployeeList } from "@/components/employee-list"

export default async function EmployeesPage() {
    const employees = await getEmployees()

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Personel</h2>
                    <p className="text-muted-foreground">Ekibinizi yönetin ve yetkilendirmeleri düzenleyin.</p>
                </div>
                <AddEmployeeDialog />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <EmployeeList employees={employees} />
            </div>
        </div>
    )
}
