import { getShoot } from "@/actions/shoot-actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Calendar,
    Clock,
    MapPin,
    User,
    ChevronLeft,
    Package,
    CreditCard,
    Clock3,
    CheckCircle2,
    XCircle,
    Timer,
    Phone,
    CheckSquare,
    Square
} from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { PaymentActions } from "@/components/payment-actions"

export default async function ShootDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const shoot = await getShoot(id)

    if (!shoot) {
        notFound()
    }

    const statusColors: Record<string, string> = {
        PLANNED: "bg-blue-100 text-blue-700",
        COMPLETED: "bg-green-100 text-green-700",
        CANCELLED: "bg-red-100 text-red-700",
    }

    const statusIcons: Record<string, any> = {
        PLANNED: Clock3,
        COMPLETED: CheckCircle2,
        CANCELLED: XCircle,
    }

    const StatusIcon = statusIcons[shoot.status] || Timer

    const remainingAmount = (shoot.totalPrice || 0) - (shoot.deposit || 0)

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/shoots">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Çekim Detayları</h2>
                    <p className="text-muted-foreground">{shoot.customer?.name} - {shoot.title}</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Sol Taraf: Temel Bilgiler */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-lg font-bold">Genel Bilgiler</CardTitle>
                            <Badge className={`${statusColors[shoot.status]} border-0 shadow-none px-3 py-1 flex gap-1.5 items-center`}>
                                <StatusIcon className="w-3.5 h-3.5" />
                                {shoot.status}
                            </Badge>
                        </CardHeader>
                        <CardContent className="pt-4 grid sm:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Müşteri</p>
                                        <p className="font-semibold text-slate-900">{shoot.customer?.name}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Tarih</p>
                                        <p className="font-semibold text-slate-900">
                                            {new Date(shoot.startDateTime).toLocaleDateString('tr-TR', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric',
                                                weekday: 'long'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Saat Aralığı</p>
                                        <p className="font-semibold text-slate-900">
                                            {new Date(shoot.startDateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })} -
                                            {new Date(shoot.endDateTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                        <Package className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Çekim Türü</p>
                                        <p className="font-semibold text-slate-900">{shoot.type}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                        <MapPin className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Konum</p>
                                        <p className="font-semibold text-slate-900">{shoot.location || "Belirtilmemiş"}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-muted-foreground uppercase">Telefon</p>
                                        <p className="font-semibold text-slate-900">{(shoot as any).phone || "Belirtilmemiş"}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {(() => {
                        const extras = (shoot as any).extras as string[] | undefined
                        const ALL_EXTRAS = [
                            { id: "album_25x70", label: "25x70 Albüm Kutu" },
                            { id: "cerceve", label: "Çerçeve" },
                            { id: "kanvas", label: "Kanvas" },
                            { id: "ask_kitabi", label: "Aşk Kitabı" },
                            { id: "klip", label: "Klip" },
                            { id: "fotograf", label: "Fotoğraf" },
                            { id: "gelin_alma", label: "Gelin Alma" },
                            { id: "dis_cekim_dis", label: "Dış Çekim (Dışarı)" },
                            { id: "dis_cekim_studyo", label: "Dış Çekim (Stüdyo)" },
                            { id: "acilis_klibi", label: "Açılış Klibi" },
                            { id: "klibi", label: "Düğün Hikayesi" },
                            { id: "drone", label: "Drone Çekim" },
                            { id: "aktuel", label: "Aktüel" },
                            { id: "kamera", label: "Kamera" },
                        ]
                        return (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold">Paket İçeriği</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-2 gap-2">
                                        {ALL_EXTRAS.map(({ id, label }) => {
                                            const checked = extras?.includes(id)
                                            return (
                                                <div key={id} className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${checked ? "bg-primary/5 border-primary/30 text-primary" : "bg-slate-50 border-slate-100 text-slate-400"
                                                    }`}>
                                                    {checked
                                                        ? <CheckSquare className="w-4 h-4 flex-shrink-0" />
                                                        : <Square className="w-4 h-4 flex-shrink-0" />
                                                    }
                                                    {label}
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {shoot.package && (
                                        <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
                                            {shoot.package}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )
                    })()}
                </div>

                {/* Sağ Taraf: Finansal Özet */}
                <div className="space-y-6">
                    <Card className="bg-slate-900 text-white border-none overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <CreditCard className="w-24 h-24 rotate-12" />
                        </div>
                        <CardHeader>
                            <CardTitle className="text-lg font-medium text-slate-400">Ödeme Özeti</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6 relative z-10">
                            <div>
                                <p className="text-3xl font-bold">{(shoot.totalPrice || 0).toLocaleString('tr-TR')} ₺</p>
                                <p className="text-xs text-slate-400 uppercase tracking-wider mt-1">Toplam Anlaşılan Tutar</p>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-slate-800">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Alınan Kapora</span>
                                    <span className="font-semibold text-green-400">{(shoot.deposit || 0).toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-slate-400">Kalan Ödeme</span>
                                    <span className="text-xl font-bold text-red-400">{remainingAmount.toLocaleString('tr-TR')} ₺</span>
                                </div>
                            </div>

                            {remainingAmount === 0 ? (
                                <div className="bg-green-500/10 text-green-400 text-xs font-bold py-2 px-3 rounded-lg border border-green-500/20 text-center uppercase tracking-widest">
                                    Ödeme Tamamlandı
                                </div>
                            ) : (
                                <div className="bg-orange-500/10 text-orange-400 text-xs font-bold py-2 px-3 rounded-lg border border-orange-500/20 text-center uppercase tracking-widest">
                                    Bekleyen Ödeme Mevcut
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">İşlemler</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full justify-start gap-2" variant="outline" asChild>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shoot.location || "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <MapPin className="w-4 h-4" />
                                    Yol Tarifi Al
                                </a>
                            </Button>
                            <PaymentActions
                                shootId={shoot.id}
                                totalPrice={shoot.totalPrice || 0}
                                deposit={shoot.deposit || 0}
                            />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
