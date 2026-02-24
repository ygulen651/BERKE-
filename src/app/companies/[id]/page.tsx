import { getCompany } from "@/actions/company-actions"
import { getShoots } from "@/actions/shoot-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
    Building2,
    Calendar,
    Mail,
    Phone,
    MapPin,
    User,
    ArrowLeft,
    Camera
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function CompanyDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const company = await getCompany(id)

    if (!company) {
        notFound()
    }

    const allShoots = await getShoots()
    const companyShoots = (allShoots as any[]).filter(s => s.companyId?.toString() === id)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/companies">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                </Link>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Building2 className="w-8 h-8 text-blue-600" />
                        {company.name}
                    </h2>
                    <p className="text-muted-foreground">Firma detayları ve çekim geçmişi.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Firma Bilgileri */}
                <Card className="md:col-span-1 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg">İletişim Bilgileri</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-start gap-3">
                            <User className="w-4 h-4 text-muted-foreground mt-1" />
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Yetkili</p>
                                <p className="font-medium">{company.representative}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Phone className="w-4 h-4 text-muted-foreground mt-1" />
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Telefon</p>
                                <p className="font-medium">{company.phone || "Belirtilmemiş"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <Mail className="w-4 h-4 text-muted-foreground mt-1" />
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">E-posta</p>
                                <p className="font-medium">{company.email || "Belirtilmemiş"}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                            <div>
                                <p className="text-xs text-muted-foreground font-medium uppercase">Adres</p>
                                <p className="font-medium text-sm">{company.address || "Belirtilmemiş"}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Çekim Listesi */}
                <Card className="md:col-span-2 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Camera className="w-5 h-5 text-blue-600" />
                            Yapılan İşler / Çekimler
                        </CardTitle>
                        <Badge variant="secondary" className="font-bold">
                            {companyShoots.length} Toplam İş
                        </Badge>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50">
                                    <TableHead>Tarih</TableHead>
                                    <TableHead>Çekim Başlığı</TableHead>
                                    <TableHead>Tür</TableHead>
                                    <TableHead>Durum</TableHead>
                                    <TableHead className="text-right">Detay</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {companyShoots.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                                            Bu firmaya ait henüz bir çekim kaydı bulunmuyor.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    companyShoots.map((shoot) => (
                                        <TableRow key={shoot.id}>
                                            <TableCell className="text-sm font-medium">
                                                {new Date(shoot.startDateTime).toLocaleDateString("tr-TR")}
                                            </TableCell>
                                            <TableCell>
                                                <div className="font-medium">{shoot.customer?.name}</div>
                                                <div className="text-xs text-muted-foreground">{shoot.title}</div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal text-[10px]">
                                                    {shoot.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={`text-[10px] shadow-none ${shoot.status === "COMPLETED" ? "bg-emerald-100 text-emerald-700" :
                                                        shoot.status === "CANCELLED" ? "bg-red-100 text-red-700" :
                                                            "bg-blue-100 text-blue-700"
                                                    }`}>
                                                    {shoot.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/shoots/${shoot.id}`}>
                                                    <Button variant="ghost" size="sm">Görüntüle</Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
