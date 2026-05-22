import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SearchInput } from "@/components/search-input"
import { AddCariDialog } from "@/components/add-cari-dialog"
import { CariActionsMenu } from "@/components/cari-actions-menu"
import { getCariRecords } from "@/actions/cari-actions"
import { getCompanies } from "@/actions/company-actions"
import { Calendar, CreditCard, Receipt, Building2 } from "lucide-react"
import Link from "next/link"

const TURKISH_MONTHS = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
]

export default async function CariPage({
    searchParams
}: {
    searchParams: Promise<{ query?: string; companyId?: string; month?: string }>
}) {
    const params = await searchParams
    const query = params.query || ""
    const activeCompanyId = params.companyId || ""
    const activeMonth = params.month || ""

    let records = await getCariRecords()
    const companies = await getCompanies()

    // 1. Filter by Month if selected
    if (activeMonth) {
        records = records.filter((r: any) => r.month === activeMonth)
    }

    // 2. Filter by Company if selected
    if (activeCompanyId) {
        if (activeCompanyId === "bireysel") {
            records = records.filter((r: any) => !r.companyId)
        } else {
            records = records.filter((r: any) => r.companyId === activeCompanyId)
        }
    }

    // 3. Filter by search query if present
    if (query) {
        const searchLower = query.toLowerCase()
        records = records.filter((r: any) => 
            (r.shoots?.toLowerCase() || "").includes(searchLower) ||
            (r.month?.toLowerCase() || "").includes(searchLower) ||
            (r.day?.toLowerCase() || "").includes(searchLower) ||
            (r.date || "").includes(searchLower) ||
            (r.companyName?.toLowerCase() || "").includes(searchLower) ||
            (r.description?.toLowerCase() || "").includes(searchLower)
        )
    }

    // Calculations
    const totalRecords = records.length
    const totalAmount = records.reduce((sum: number, r: any) => sum + (Number(r.totalAmount) || 0), 0)
    const totalPaid = records.reduce((sum: number, r: any) => sum + (Number(r.paidAmount) || 0), 0)
    const totalRemaining = records.reduce((sum: number, r: any) => sum + (Number(r.remainingAmount) || 0), 0)

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("tr-TR", {
            style: "currency",
            currency: "TRY"
        }).format(val)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Cari Hesap Takibi
                    </h2>
                    <p className="text-muted-foreground">
                        Tarih, ay, gün, firma ve çekim ödemelerini detaylı olarak yönetin.
                    </p>
                </div>
                <AddCariDialog companies={companies} />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border border-slate-100 shadow-sm bg-gradient-to-br from-white to-blue-50/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">Toplam Tutar</CardTitle>
                        <Receipt className="h-4.5 w-4.5 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-slate-900">{formatCurrency(totalAmount)}</div>
                        <p className="text-xs text-muted-foreground mt-1">Seçili dönem hak edilen toplam tutar</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-100 shadow-sm bg-gradient-to-br from-white to-emerald-50/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">Toplam Ödenen</CardTitle>
                        <CreditCard className="h-4.5 w-4.5 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-extrabold text-emerald-600">{formatCurrency(totalPaid)}</div>
                        <p className="text-xs text-emerald-700 mt-1 font-medium">Tahsil edilen toplam miktar (Yeşil)</p>
                    </CardContent>
                </Card>

                <Card className="border border-slate-100 shadow-sm bg-gradient-to-br from-white to-rose-50/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-semibold text-slate-600">Toplam Kalan</CardTitle>
                        <CreditCard className="h-4.5 w-4.5 text-rose-600" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-3xl font-extrabold text-rose-600 ${totalRemaining > 0 ? "animate-pulse" : ""}`}>
                            {formatCurrency(totalRemaining)}
                        </div>
                        <p className="text-xs text-rose-700 mt-1 font-medium">
                            {totalRemaining > 0 ? "Bekleyen toplam alacak tutarı (Kırmızı)" : "Tüm ödemeler tamamlandı!"}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Actions & Filters */}
            <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                    <SearchInput placeholder="Tarih, ay, gün, çekim veya firma ile ara..." />
                </div>

                {/* Month Filter Selector (As Requested: "AY AY YÖNETİLECEK") */}
                <div className="flex flex-wrap items-center gap-1.5 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                    <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Ay Filtresi:
                    </span>
                    <Link href={`/cari${activeCompanyId ? `?companyId=${activeCompanyId}` : ""}${query ? `&query=${query}` : ""}`}>
                        <Button
                            variant={!activeMonth ? "default" : "ghost"}
                            size="sm"
                            className="rounded-full text-xs font-semibold h-7.5 px-3"
                        >
                            Tümü
                        </Button>
                    </Link>
                    {TURKISH_MONTHS.map((m) => {
                        const isSelected = activeMonth === m
                        const url = `/cari?month=${m}${activeCompanyId ? `&companyId=${activeCompanyId}` : ""}${query ? `&query=${query}` : ""}`
                        return (
                            <Link key={m} href={url}>
                                <Button
                                    variant={isSelected ? "default" : "ghost"}
                                    size="sm"
                                    className={`rounded-full text-xs font-semibold h-7.5 px-3 ${
                                        isSelected ? "" : "text-slate-600 hover:bg-slate-100"
                                    }`}
                                >
                                    {m}
                                </Button>
                            </Link>
                        )
                    })}
                </div>

                {/* Company Filter Buttons */}
                <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        Firma Filtresi:
                    </span>
                    <Link href={`/cari${activeMonth ? `?month=${activeMonth}` : ""}${query ? `&query=${query}` : ""}`}>
                        <Button
                            variant={!activeCompanyId ? "default" : "outline"}
                            size="sm"
                            className="rounded-full text-xs font-semibold h-7.5 px-3"
                        >
                            Tümü
                        </Button>
                    </Link>
                    <Link href={`/cari?companyId=bireysel${activeMonth ? `&month=${activeMonth}` : ""}${query ? `&query=${query}` : ""}`}>
                        <Button
                            variant={activeCompanyId === "bireysel" ? "default" : "outline"}
                            size="sm"
                            className="rounded-full text-xs font-semibold h-7.5 px-3"
                        >
                            Bireysel (Firma Yok)
                        </Button>
                    </Link>
                    {companies.map((c: any) => {
                        const isSelected = activeCompanyId === c.id
                        const url = `/cari?companyId=${c.id}${activeMonth ? `&month=${activeMonth}` : ""}${query ? `&query=${query}` : ""}`
                        return (
                            <Link key={c.id} href={url}>
                                <Button
                                    variant={isSelected ? "default" : "outline"}
                                    size="sm"
                                    className="rounded-full text-xs font-semibold h-7.5 px-3"
                                >
                                    {c.name}
                                </Button>
                            </Link>
                        )
                    })}
                </div>
            </div>

            {/* Table */}
            <div className="border border-slate-100 rounded-xl bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50/50">
                            <TableHead className="font-semibold text-slate-700">Tarih</TableHead>
                            <TableHead className="font-semibold text-slate-700">Ay</TableHead>
                            <TableHead className="font-semibold text-slate-700">Gün</TableHead>
                            <TableHead className="font-semibold text-slate-700">Çekimler / Firma</TableHead>
                            <TableHead className="font-semibold text-slate-700">Toplam Tutar</TableHead>
                            <TableHead className="font-semibold text-slate-700">Ödenen Tutar</TableHead>
                            <TableHead className="font-semibold text-slate-700">Kalan Tutar</TableHead>
                            <TableHead className="font-semibold text-slate-700">Durum</TableHead>
                            <TableHead className="font-semibold text-slate-700">Açıklama</TableHead>
                            <TableHead className="text-right font-semibold text-slate-700">İşlemler</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {records.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                                    Aradığınız kriterlere uygun cari hesap kaydı bulunmuyor.
                                </TableCell>
                            </TableRow>
                        ) : (
                            records.map((record: any) => (
                                <TableRow key={record.id} className="hover:bg-slate-50 transition-colors">
                                    <TableCell className="font-medium text-slate-900">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(record.date).toLocaleDateString("tr-TR")}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-100 shadow-none border-0 font-bold px-2.5 py-1">
                                            {record.month}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-slate-600 font-medium">{record.day}</TableCell>
                                    <TableCell>
                                        <div className="font-semibold text-slate-800">{record.shoots}</div>
                                        {record.companyName ? (
                                            <div className="text-[10px] text-blue-600 font-bold mt-1 flex items-center gap-1">
                                                <span>🏢</span> {record.companyName}
                                            </div>
                                        ) : (
                                            <div className="text-[10px] text-slate-400 font-medium mt-1 flex items-center gap-1">
                                                <span>👤</span> Bireysel İş
                                            </div>
                                        )}
                                    </TableCell>
                                    <TableCell className="font-bold text-slate-700">
                                        {formatCurrency(record.totalAmount)}
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 py-1 rounded-md font-bold text-xs inline-block shadow-sm">
                                            {formatCurrency(record.paidAmount)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <span className={`px-2 py-1 rounded-md font-bold text-xs inline-block shadow-sm border ${
                                            record.remainingAmount > 0 
                                                ? "text-rose-700 bg-rose-50 border-rose-200 animate-pulse" 
                                                : "text-emerald-700 bg-emerald-50 border-emerald-250"
                                        }`}>
                                            {formatCurrency(record.remainingAmount)}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        {record.remainingAmount > 0 ? (
                                            <Badge variant="secondary" className="bg-rose-50 text-rose-700 border border-rose-100 hover:bg-rose-100 font-bold px-2 py-0.5 animate-pulse shadow-none text-[10px]">
                                                🔴 Ödeme Bekliyor
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 font-bold px-2 py-0.5 shadow-none text-[10px]">
                                                🟢 Ödendi
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs text-slate-500 max-w-[150px] truncate">
                                        {record.description || "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <CariActionsMenu record={record} companies={companies} />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
