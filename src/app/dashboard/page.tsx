import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Camera,
    Clock,
    CreditCard,
    PlusCircle,
    UserPlus,
    Send,
    Calendar as CalendarIcon
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { getShoots } from "@/actions/shoot-actions"
import { getTasks } from "@/actions/task-actions"
import { getCustomers } from "@/actions/customer-actions"
import { getFinanceStats } from "@/actions/finance-actions"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export default async function DashboardPage() {
    const session = await getServerSession(authOptions)
    const isAdmin = session?.user?.role === "ADMIN"

    const shoots = await getShoots()
    const tasks = await getTasks()
    const customers = await getCustomers()
    const { totalIncome } = isAdmin ? await getFinanceStats() : { totalIncome: 0 }

    const today = new Date().toISOString().split('T')[0]
    const todayShoots = (shoots as any[]).filter(s => new Date(s.startDateTime).toISOString().startsWith(today))
    const pendingTasks = (tasks as any[]).filter(t => t.status !== "COMPLETED")

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
                            {shoots.length === 0 ? (
                                <p className="text-center py-8 text-muted-foreground text-sm">Henüz çekim kaydı yok.</p>
                            ) : (
                                (shoots as any[]).slice(0, 5).map((shoot: any) => {
                                    const totalPrice = parseFloat(shoot.totalPrice || 0)
                                    const deposit = parseFloat(shoot.deposit || 0)
                                    const remaining = totalPrice - deposit

                                    return (
                                        <div key={shoot.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                                            <div className="bg-primary/10 p-2 rounded text-primary flex-shrink-0">
                                                <CalendarIcon className="w-4 h-4" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-sm truncate">
                                                    {shoot.customer?.name}
                                                    {shoot.company && (
                                                        <span className="text-[10px] ml-2 text-blue-600 font-bold bg-blue-50 px-1 rounded">
                                                            {shoot.company.name}
                                                        </span>
                                                    )}
                                                </h4>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {shoot.title} - {new Date(shoot.startDateTime).toLocaleDateString("tr-TR")}
                                                </p>
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
                                (tasks as any[]).slice(0, 5).map((task: any) => (
                                    <div key={task.id} className="flex items-start gap-3 text-sm">
                                        <div className={`mt-1.5 w-2 h-2 rounded-full ${task.status === "COMPLETED" ? "bg-green-500" : "bg-amber-500"}`} />
                                        <div>
                                            <p className="font-medium">{task.title}</p>
                                            <p className="text-xs text-muted-foreground">Atanan: {task.assignee?.name}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
