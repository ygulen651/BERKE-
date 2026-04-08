"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Users,
    Mail,
    Phone,
    MoreVertical,
    Trash2,
    ShieldCheck,
    UserCheck
} from "lucide-react"
import { deleteEmployee, changeEmployeeRole } from "@/actions/employee-actions"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function EmployeeList({ employees }: { employees: any[] }) {
    if (employees.length === 0) {
        return (
            <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl text-muted-foreground">
                Henüz personel eklenmemiş. &quot;Yeni Personel&quot; butonu ile başlayabilirsiniz.
            </div>
        )
    }

    return (
        <>
            {employees.map((staff: any) => (
                <Card key={staff.id} className="hover:shadow-lg transition-shadow overflow-hidden group">
                    <CardHeader className="bg-slate-50/50 pb-4 relative">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{staff.name}</CardTitle>
                                <div className="flex items-center gap-2">
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${staff.role === "ADMIN" ? "bg-blue-100 text-blue-700" : "bg-slate-200"}`}>
                                        {staff.role}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-medium">
                                        {staff.employee?.position || "Pozisyon Belirtilmedi"}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="absolute top-4 right-4 h-8 w-8">
                                    <MoreVertical className="w-4 h-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {staff.role === "EMPLOYEE" ? (
                                    <DropdownMenuItem
                                        className="text-blue-600 focus:text-blue-600 cursor-pointer"
                                        onClick={() => changeEmployeeRole(staff.id, "ADMIN")}
                                    >
                                        <ShieldCheck className="w-4 h-4 mr-2" />
                                        Admin Yap
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem
                                        className="text-orange-600 focus:text-orange-600 cursor-pointer"
                                        onClick={() => changeEmployeeRole(staff.id, "EMPLOYEE")}
                                    >
                                        <UserCheck className="w-4 h-4 mr-2" />
                                        Personel Yap
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    className="text-red-600 focus:text-red-600 cursor-pointer"
                                    onClick={() => deleteEmployee(staff.id)}
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Personeli Sil
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-4 h-4" />
                            {staff.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-4 h-4" />
                            {staff.phone || "Telefon Belirtilmedi"}
                        </div>
                        <hr className="my-2 border-slate-100" />
                        <div className="flex justify-between items-center">
                            <div className="text-xs text-muted-foreground">
                                Eklenme: {new Date(staff.createdAt).toLocaleDateString("tr-TR")}
                            </div>
                            <Button variant="outline" size="sm" className="h-8 py-0 px-3 text-xs">
                                Profil
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </>
    )
}
