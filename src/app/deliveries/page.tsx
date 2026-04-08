import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import {
    Camera,
    CheckCircle2,
    Clock,
    PackageCheck,
    PackageSearch,
    Search,
    User,
    Building2,
    Filter,
    MoreVertical,
    Trash2,
    Eye
} from "lucide-react"
import { getShoots, toggleDeliveryStatus } from "@/actions/shoot-actions"
import { getCompanies, deleteCompany } from "@/actions/company-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/search-input"
import { AddCompanyDialog } from "@/components/add-company-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import Link from "next/link"

export default async function DeliveriesPage({
    searchParams
}: {
    searchParams: Promise<{ query?: string; tab?: string }>
}) {
    const params = await searchParams
    const query = params.query || ""
    const activeTab = params.tab || "delivery"

    const allShoots = await getShoots(query)
    const companies = await getCompanies(query)

    // "Yapılmış işler" - Tarihi gelmiş veya geçmiş çekimleri veya tamamlanmışları göster
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)

    const completedShoots = (allShoots as any[]).filter(s => {
        const shootDate = new Date(s.startDateTime)
        const isPastOrToday = shootDate <= today
        return isPastOrToday || s.status === "COMPLETED" || s.deliveryStatus === "DELIVERED"
    }).sort((a, b) => new Date(b.startDateTime).getTime() - new Date(a.startDateTime).getTime())

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">İş Yönetimi & Teslimat</h1>
                    <p className="text-muted-foreground">Yapılmış işleri, teslimat durumlarını ve kurumsal firmaları buradan yönetin.</p>
                </div>
            </div>

            <Tabs defaultValue={activeTab} className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2 mb-8">
                    <TabsTrigger value="delivery" className="gap-2">
                        <PackageCheck className="w-4 h-4" />
                        Teslimat Takibi
                    </TabsTrigger>
                    <TabsTrigger value="companies" className="gap-2">
                        <Building2 className="w-4 h-4" />
                        Firmalar
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="delivery" className="space-y-6">
                    <div className="flex items-center gap-3">
                        <SearchInput placeholder="Müşteri veya çekim ara..." />
                    </div>

                    <div className="space-y-8">
                        {(() => {
                            // Gruplandırma mantığı
                            const groupedByCompany: Record<string, { company: any; shoots: any[] }> = {}
                            const individualShoots: any[] = []

                            completedShoots.forEach(shoot => {
                                if (shoot.company) {
                                    const compId = shoot.company.id.toString()
                                    if (!groupedByCompany[compId]) {
                                        groupedByCompany[compId] = { company: shoot.company, shoots: [] }
                                    }
                                    groupedByCompany[compId].shoots.push(shoot)
                                } else {
                                    individualShoots.push(shoot)
                                }
                            })

                            const companyGroups = Object.values(groupedByCompany).sort((a, b) => a.company.name.localeCompare(b.company.name))

                            return (
                                <>
                                    {/* Firma Bazlı İşler */}
                                    {companyGroups.map(({ company, shoots }) => (
                                        <div key={company.id} className="space-y-4">
                                            <div className="flex items-center gap-3 pb-2 border-b">
                                                <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                                                    <Building2 className="w-5 h-5" />
                                                </div>
                                                <h2 className="text-xl font-bold text-slate-800">{company.name}</h2>
                                                <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                                                    {shoots.length} İş
                                                </Badge>
                                            </div>
                                            <div className="grid gap-4">
                                                {shoots.map(renderShootCard)}
                                            </div>
                                        </div>
                                    ))}

                                    {/* Bireysel İşler */}
                                    {individualShoots.length > 0 && (
                                        <div className="space-y-4 pt-4">
                                            <div className="flex items-center gap-3 pb-2 border-b">
                                                <div className="bg-slate-600 p-1.5 rounded-lg text-white">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <h2 className="text-xl font-bold text-slate-800">Bireysel İşler</h2>
                                                <Badge variant="outline" className="ml-2 bg-slate-50 text-slate-700 border-slate-200">
                                                    {individualShoots.length} İş
                                                </Badge>
                                            </div>
                                            <div className="grid gap-4">
                                                {individualShoots.map(renderShootCard)}
                                            </div>
                                        </div>
                                    )}

                                    {completedShoots.length === 0 && (
                                        <Card className="border-dashed">
                                            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                                                <PackageSearch className="w-12 h-12 text-slate-300 mb-4" />
                                                <p className="text-slate-500">Henüz tamamlanmış bir iş bulunmuyor.</p>
                                            </CardContent>
                                        </Card>
                                    )}
                                </>
                            )

                            // Kart render fonksiyonu (temiz görünüm için)
                            function renderShootCard(shoot: any) {
                                const isDelivered = shoot.deliveryStatus === "DELIVERED"
                                return (
                                    <Card key={shoot.id} className={`overflow-hidden transition-all ${isDelivered ? 'bg-emerald-50/10 border-emerald-100' : 'hover:border-blue-200'}`}>
                                        <CardContent className="p-0">
                                            <div className="flex flex-col md:flex-row md:items-center p-4 gap-4">
                                                <div className={`p-3 rounded-xl flex-shrink-0 ${isDelivered ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                    <Camera className="w-6 h-6" />
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-bold text-lg truncate">{shoot.customer?.name}</h3>
                                                        {isDelivered ? (
                                                            <Badge className="bg-emerald-500 text-white border-none gap-1 py-0.5">
                                                                <CheckCircle2 className="w-3 h-3" />
                                                                Teslim Edildi
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 gap-1 py-0.5">
                                                                <Clock className="w-3 h-3" />
                                                                Teslimat Bekliyor
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                                                        <div className="flex items-center gap-1">
                                                            <PackageCheck className="w-4 h-4" />
                                                            {shoot.title}
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <User className="w-4 h-4" />
                                                            {new Date(shoot.startDateTime).toLocaleDateString("tr-TR")}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 md:ml-auto">
                                                    <Link href={`/shoots/${shoot.id}`}>
                                                        <Button variant="outline" size="sm">Detaylar</Button>
                                                    </Link>
                                                    <form action={async () => {
                                                        "use server"
                                                        await toggleDeliveryStatus(shoot.id, shoot.deliveryStatus)
                                                    }}>
                                                        <Button
                                                            size="sm"
                                                            variant={isDelivered ? "secondary" : "default"}
                                                            className={isDelivered ? "" : "bg-blue-600 hover:bg-blue-700"}
                                                        >
                                                            {isDelivered ? "Teslim Edilmedi İşaretle" : "Teslim Edildi İşaretle"}
                                                        </Button>
                                                    </form>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            }
                        })()}
                    </div>
                </TabsContent>

                <TabsContent value="companies" className="space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-3">
                            <SearchInput placeholder="Firma adı, yetkili veya telefon ile ara..." />
                            <Button variant="outline" className="gap-2">
                                <Filter className="w-4 h-4" />
                                Filtrele
                            </Button>
                        </div>
                        <AddCompanyDialog />
                    </div>

                    <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead>Firma Bilgileri</TableHead>
                                    <TableHead>Yetkili Kişi</TableHead>
                                    <TableHead>İletişim</TableHead>
                                    <TableHead>Eklenme Tarihi</TableHead>
                                    <TableHead className="text-right">İşlemler</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {companies.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                                            Henüz firma kaydı bulunmuyor.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    companies.map((company: any) => (
                                        <TableRow key={company.id} className="hover:bg-slate-50">
                                            <TableCell>
                                                <div className="font-bold flex items-center gap-2 text-blue-600">
                                                    <Building2 className="w-4 h-4" />
                                                    {company.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                    {company.address || "-"}
                                                </div>
                                            </TableCell>
                                            <TableCell className="font-medium">{company.representative}</TableCell>
                                            <TableCell>
                                                <div className="text-sm">{company.phone || "-"}</div>
                                                <div className="text-xs text-muted-foreground">{company.email || "-"}</div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(company.createdAt).toLocaleDateString("tr-TR")}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link href={`/companies/${company.id}`}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600">
                                                            <Eye className="w-4 h-4" />
                                                        </Button>
                                                    </Link>

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreVertical className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <form action={async () => {
                                                                "use server"
                                                                await deleteCompany(company.id)
                                                            }}>
                                                                <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer">
                                                                    <button type="submit" className="flex items-center w-full">
                                                                        <Trash2 className="w-4 h-4 mr-2" />
                                                                        Firmayı Sil
                                                                    </button>
                                                                </DropdownMenuItem>
                                                            </form>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
