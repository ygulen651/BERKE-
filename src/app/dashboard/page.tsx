import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Camera,
    Clock,
    CreditCard,
    PlusCircle,
    UserPlus,
    Send,
    Calendar as CalendarIcon,
    AlertCircle
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { getShoots } from "@/actions/shoot-actions"
import { getTasks } from "@/actions/task-actions"
import { getEmployees } from "@/actions/employee-actions"
import { getCustomers } from "@/actions/customer-actions"
import { getCompanies } from "@/actions/company-actions"
import { getFinanceStats } from "@/actions/finance-actions"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === "ADMIN"

    const shoots = await getShoots()
    const tasks = await getTasks()
    const employees = await getEmployees()
    const customers = await getCustomers()
    const companies = await getCompanies()
    const { totalIncome } = isAdmin ? await getFinanceStats() : { totalIncome: 0 }

    // Bugünün tarihini Türkiye saat dilimine (Europe/Istanbul) göre alalım:
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" })
    
    // Bugünün çekimlerini filtreleyelim:
    const todayShoots = (shoots as any[]).filter(s => {
        try {
            const shootDateStr = new Date(s.startDateTime).toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" })
            return shootDateStr === today
        } catch (e) {
            return false
        }
    })

    // Yaklaşan/Bekleyen çekimleri filtreleyip en yakından en uzağa (artan düzende) sıralayalım:
    const upcomingShoots = (shoots as any[])
        .filter(s => {
            try {
                const shootDateStr = new Date(s.startDateTime).toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" })
                // Bugün ve gelecekteki, tamamlanmamış çekimler
                return shootDateStr >= today && s.status !== "COMPLETED"
            } catch (e) {
                return false
            }
        })
        .sort((a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime())

    const pendingTasks = (tasks as any[]).filter(t => t.status !== "COMPLETED")

    const overdueShoots = (shoots as any[])
        .filter(s => {
            try {
                const shootDateStr = new Date(s.startDateTime).toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" })
                const totalPrice = parseFloat(s.totalPrice || 0)
                const deposit = parseFloat(s.deposit || 0)
                const remaining = totalPrice - deposit
                return shootDateStr < today && remaining > 0
            } catch (e) {
                return false
            }
        })
        .sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime())

    const stats = [
        { title: "Bugünkü Çekimler", value: todayShoots.length.toString(), icon: Camera, color: "text-blue-600", bg: "bg-blue-100" },
        { title: "Aktif Görevler", value: pendingTasks.length.toString(), icon: Clock, color: "text-amber-600", bg: "bg-amber-100" },
        { title: "Toplam Müşteri", value: customers.length.toString(), icon: UserPlus, color: "text-purple-600", bg: "bg-purple-100" },
        // Toplam Ciro sadece ADMIN'e gösterilir:
        ...(isAdmin ? [{
            title: "Toplam Ciro",
            value: `₺${totalIncome.toLocaleString("tr-TR")}`,
            icon: CreditCard,
            color: "text-emerald-600",
            bg: "bg-emerald-100"
        }] : []),
    ]

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Hoşgeldiniz, {session?.user?.name || "Admin"}</h2>
                <p className="text-muted-foreground">İşte stüdyonuzun bugünkü özeti.</p>
            </div>

            {/* Hızlı Butonlar */}
            <div className="flex flex-wrap gap-4">
                {isAdmin && (
                    <Link href="/shoots">
                        <Button className="gap-2">
                            <PlusCircle className="w-4 h-4" />
                            Yeni Çekim
                        </Button>
                    </Link>
                )}
                {isAdmin && (
                    <Link href="/customers">
                        <Button variant="outline" className="gap-2">
                            <UserPlus className="w-4 h-4" />
                            Yeni Müşteri
                        </Button>
                    </Link>
                )}
                <Link href="/tasks">
                    <Button variant="outline" className="gap-2">
                        <Send className="w-4 h-4" />
                        Görev Ata
                    </Button>
                </Link>
            </div>

            {/* Özet Kartları */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <Card key={stat.title} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Bekleyen Çekimler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingShoots.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground text-sm">Yaklaşan bekleyen çekim bulunmuyor.</p>
                            ) : (
                                upcomingShoots.slice(0, 5).map((shoot: any) => {
                                    const totalPrice = parseFloat(shoot.totalPrice || 0)
                                    const deposit = parseFloat(shoot.deposit || 0)
                                    const remaining = totalPrice - deposit
                                    const isToday = new Date(shoot.startDateTime).toLocaleDateString("sv-SE", { timeZone: "Europe/Istanbul" }) === today

                                    return (
                                        <div key={shoot.id} className={`flex items-center gap-4 p-3 border rounded-lg transition-all ${
                                            isToday 
                                                ? "border-red-500 bg-red-50/50 animate-pulse text-red-950 shadow-md shadow-red-100/50" 
                                                : "hover:bg-slate-50 border-slate-200"
                                        }`}>
                                            <div className={`p-2 rounded flex-shrink-0 ${
                                                isToday 
                                                    ? "bg-red-200 text-red-700" 
                                                    : "bg-primary/10 text-primary"
                                            }`}>
                                                <CalendarIcon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm truncate">
                                                    {(() => {
                                                        const customer = customers.find((c: any) => c.id === shoot.customerId)
                                                        const company = companies.find((c: any) => c.id === shoot.companyId)
                                                        return customer?.name || company?.name || "Müşteri"
                                                    })()}
                                                </h4>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {shoot.title} - {new Date(shoot.startDateTime).toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })}
                                                </p>
                                                {isAdmin && (
                                                    <div className="mt-1 flex gap-2">
                                                        {totalPrice > 0 ? (
                                                            remaining > 0 ? (
                                                                <Badge variant="outline" className="text-[10px] h-5 bg-red-50 text-red-600 border-red-100 font-bold">
                                                                    Kalan: ₺{remaining.toLocaleString("tr-TR")}
                                                                </Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-[10px] h-5 bg-emerald-50 text-emerald-600 border-emerald-100 font-bold">
                                                                    Ödendi
                                                                </Badge>
                                                            )
                                                        ) : (
                                                            <Badge variant="outline" className="text-[10px] h-5 bg-slate-50 text-slate-500 border-slate-100 italic">
                                                                Fiyat Girilmemiş
                                                            </Badge>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                            {isAdmin && (
                                                <Link href={`/shoots/${shoot.id}`} className="ml-auto flex-shrink-0">
                                                    <Button variant="ghost" size="sm">Detay</Button>
                                                </Link>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Son Görevler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {tasks.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground text-sm">Görev bulunmuyor.</p>
                            ) : (
                                (tasks as any[]).slice(0, 5).map((task: any) => {
                                    const employee = employees.find((e: any) => e.id === task.assignedTo)
                                    return (
                                        <div key={task.id} className="flex items-start gap-3 text-sm">
                                            <div className={`mt-1.5 w-2 h-2 rounded-full ${task.status === "COMPLETED" ? "bg-green-500" : "bg-amber-500"}`} />
                                            <div>
                                                <p className="font-medium">{task.title}</p>
                                                <p className="text-xs text-muted-foreground">Atanan: {employee?.name || task.assignee?.name || "Atanmadı"}</p>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {isAdmin && (
                <div className="grid gap-4 md:grid-cols-1">
                    <Card className="border-red-200 bg-red-50/20">
                        <CardHeader>
                            <CardTitle className="text-red-800 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Ödemesi Geciken / Bekleyen Tahsilatlar
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {overdueShoots.length === 0 ? (
                                    <p className="text-muted-foreground text-sm col-span-full">Geciken ödeme bulunmuyor.</p>
                                ) : (
                                    overdueShoots.map((shoot: any) => {
                                        const totalPrice = parseFloat(shoot.totalPrice || 0)
                                        const deposit = parseFloat(shoot.deposit || 0)
                                        const remaining = totalPrice - deposit
                                        const customer = customers.find((c: any) => c.id === shoot.customerId)
                                        const company = companies.find((c: any) => c.id === shoot.companyId)
                                        const name = customer?.name || company?.name || "Müşteri"

                                        return (
                                            <div key={shoot.id} className="bg-white p-4 rounded-lg border border-red-100 shadow-sm flex flex-col gap-2 transition-shadow hover:shadow-md">
                                                <div className="flex justify-between items-start">
                                                    <div className="min-w-0 flex-1 pr-2">
                                                        <h4 className="font-bold text-sm text-slate-800 truncate">{name}</h4>
                                                        <p className="text-xs text-muted-foreground truncate">{shoot.title}</p>
                                                    </div>
                                                    <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 font-bold whitespace-nowrap">
                                                        Kalan: ₺{remaining.toLocaleString("tr-TR")}
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                                        <CalendarIcon className="w-3 h-3" />
                                                        {new Date(shoot.startDateTime).toLocaleDateString("tr-TR", { timeZone: "Europe/Istanbul" })}
                                                    </span>
                                                    <Link href={`/shoots/${shoot.id}`}>
                                                        <Button variant="ghost" size="sm" className="h-7 text-xs">Detay</Button>
                                                    </Link>
                                                </div>
                                            </div>
                                        )
                                    })
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
