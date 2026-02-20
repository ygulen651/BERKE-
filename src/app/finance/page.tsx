import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    CreditCard,
    DollarSign,
    ArrowUpRight,
    ArrowDownRight,
    User
} from "lucide-react"
import { getTransactions, getFinanceStats } from "@/actions/finance-actions"
import { getEmployees } from "@/actions/employee-actions"
import { getShoots } from "@/actions/shoot-actions"
import { getInventory } from "@/actions/inventory-actions"
import { AddPaymentDialog } from "@/components/add-payment-dialog"
import { AddIncomeDialog } from "@/components/add-income-dialog"
import { TransactionActionsMenu } from "@/components/transaction-actions-menu"
import { Badge } from "@/components/ui/badge"

export default async function FinancePage() {
    const transactions = await getTransactions()
    const employees = await getEmployees()
    const shoots = await getShoots()
    const inventory = await getInventory()
    const {
        totalIncome,
        totalExpense,
        balance,
        totalProjectedRevenue,
        totalRemainingBalance
    } = await getFinanceStats()

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Finans</h2>
                    <p className="text-muted-foreground">Stüdyo gelirlerini, giderlerini ve ödemeleri takip edin.</p>
                </div>
                <div className="flex gap-2">
                    <AddIncomeDialog shoots={shoots} inventory={inventory} />
                    <AddPaymentDialog employees={employees} />
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
                <Card className="bg-emerald-50/30 border-emerald-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium text-emerald-800">Toplam Gelir</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-emerald-600">₺{totalIncome.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                        <p className="text-[10px] text-emerald-700/60 mt-1">
                            Kasada olan nakit
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-red-50/30 border-red-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium text-red-800">Toplam Gider</CardTitle>
                        <TrendingDown className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-red-600">₺{totalExpense.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                        <p className="text-[10px] text-red-700/60 mt-1">
                            Ödenen toplam miktar
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-slate-50/50 border-slate-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium text-slate-800">Kasa / Bakiye</CardTitle>
                        <Wallet className="h-4 w-4 text-slate-600" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-xl font-bold ${balance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            ₺{balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">
                            Net nakit akışı
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50/30 border-blue-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium text-blue-800">Anlaşılan Toplam</CardTitle>
                        <CreditCard className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-blue-600">₺{totalProjectedRevenue.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                        <p className="text-[10px] text-blue-700/60 mt-1">
                            Çekimlerin toplam bedeli
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-amber-50/30 border-amber-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-xs font-medium text-amber-800">Kalan Tahsilat</CardTitle>
                        <DollarSign className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-bold text-amber-600">₺{totalRemainingBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</div>
                        <p className="text-[10px] text-amber-700/60 mt-1">
                            Müşterilerden beklenen
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Son Finansal Hareketler</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {transactions.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                <p className="text-sm">Henüz finansal hareket bulunmuyor.</p>
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-slate-50 border-b">
                                        <tr>
                                            <th className="text-left p-3 font-medium">Tarih</th>
                                            <th className="text-left p-3 font-medium">Açıklama</th>
                                            <th className="text-left p-3 font-medium">İlgili</th>
                                            <th className="text-right p-3 font-medium">Tutar</th>
                                            <th className="text-right p-3 font-medium w-[80px]">İşlemler</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {transactions.map((t: any) => (
                                            <tr key={t.id} className="hover:bg-slate-50/50">
                                                <td className="p-3 text-slate-500">
                                                    {new Date(t.date).toLocaleDateString('tr-TR')}
                                                </td>
                                                <td className="p-3">
                                                    <div className="flex items-center gap-2">
                                                        {t.type === "INCOME" ? (
                                                            <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                                                        ) : (
                                                            <ArrowDownRight className="w-3 h-3 text-red-500" />
                                                        )}
                                                        <span className="font-medium">{t.title || t.category}</span>
                                                    </div>
                                                    {t.description && (
                                                        <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                                                    )}
                                                </td>
                                                <td className="p-3">
                                                    {t.relatedName ? (
                                                        <Badge variant="outline" className="gap-1 font-normal">
                                                            <User className="w-3 h-3" />
                                                            {t.relatedName}
                                                        </Badge>
                                                    ) : "-"}
                                                </td>
                                                <td className={`p-3 text-right font-bold ${t.type === 'INCOME' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {t.type === 'INCOME' ? '+' : '-'}₺{t.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-3 text-right">
                                                    <TransactionActionsMenu
                                                        transaction={t}
                                                        employees={employees}
                                                        shoots={shoots}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
