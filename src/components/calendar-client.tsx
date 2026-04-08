"use client"

import { useState, useMemo, useRef } from "react"
import FullCalendar from "@fullcalendar/react"
import dayGridPlugin from "@fullcalendar/daygrid"
import timeGridPlugin from "@fullcalendar/timegrid"
import interactionPlugin from "@fullcalendar/interaction"
import multiMonthPlugin from "@fullcalendar/multimonth"
import trLocale from "@fullcalendar/core/locales/tr"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Info, User } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { EditShootDialog } from "./edit-shoot-dialog"

interface Shoot {
    id: string
    title: string
    type?: string
    startDateTime: any
    endDateTime: any
    customer?: { name: string }
    company?: { id: string, name: string }
    location?: string
    notes?: string
    staffs?: { id: string, name: string }[]
    staffIds?: string[]
}

interface CalendarClientProps {
    initialEvents: Shoot[]
    customers: any[]
    companies: any[]
    employees: any[]
    inventory: any[]
}

const getEventColor = (type: string) => {
    switch (type) {
        case "Düğün": return "#3b82f6" // blue
        case "Nişan": return "#8b5cf6" // purple
        case "Ürün": return "#10b981" // green
        case "Dış Çekim": return "#f59e0b" // amber
        default: return "#6366f1" // indigo
    }
}

export function CalendarClient({ initialEvents, customers, companies, employees, inventory }: CalendarClientProps) {
    const calendarRef = useRef<FullCalendar>(null)
    const [view, setView] = useState("dayGridMonth")
    const [selectedEvent, setSelectedEvent] = useState<Shoot | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [title, setTitle] = useState("")

    // FullCalendar formatına çevrilmiş eventleri useMemo ile hesapla (useEffect hatasını çözer)
    const events = useMemo(() => {
        if (!initialEvents) return []
        return initialEvents.map((shoot: Shoot) => ({
            id: shoot.id,
            title: `${shoot.customer?.name || 'Müşteri'} - ${shoot.title}`,
            start: shoot.startDateTime,
            end: shoot.endDateTime,
            backgroundColor: getEventColor(shoot.type || ""),
            borderColor: getEventColor(shoot.type || ""),
            extendedProps: {
                ...shoot
            }
        }))
    }, [initialEvents])

    const handleViewChange = (newView: string) => {
        setView(newView)
        const calendarApi = calendarRef?.current?.getApi()
        if (calendarApi) {
            calendarApi.changeView(newView)
        }
    }

    const handlePrev = () => {
        calendarRef.current?.getApi().prev()
    }

    const handleNext = () => {
        calendarRef.current?.getApi().next()
    }

    const handleToday = () => {
        calendarRef.current?.getApi().today()
    }

    const handleEventClick = (info: { event: any }) => {
        const eventProps = info.event.extendedProps as Shoot;
        setSelectedEvent({
            ...eventProps,
            id: info.event.id,
            startDateTime: info.event.start,
            endDateTime: info.event.end,
            title: info.event.title
        })
        setIsDialogOpen(true)
    }

    return (
        <>
            <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="flex flex-col md:flex-row items-center justify-between bg-slate-50/50 border-b p-4 gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Camera className="w-5 h-5 text-primary" />
                            Stüdyo Ajandası
                        </CardTitle>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <Button variant="outline" size="icon" onClick={handlePrev} className="h-8 w-8">
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleToday} className="h-8 text-xs">
                                    Bugün
                                </Button>
                                <Button variant="outline" size="icon" onClick={handleNext} className="h-8 w-8">
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                            </div>
                            <h2 className="text-lg font-bold text-slate-700 capitalize">
                                {title}
                            </h2>
                        </div>
                    </div>

                    <div className="flex bg-white border rounded-lg p-1 shadow-sm w-full md:w-auto justify-center">
                        <Button
                            variant={view === "multiMonthYear" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => handleViewChange("multiMonthYear")}
                            className="text-xs px-3 flex-1 md:flex-initial"
                        >
                            Yıl
                        </Button>
                        <Button
                            variant={view === "dayGridMonth" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => handleViewChange("dayGridMonth")}
                            className="text-xs px-3 flex-1 md:flex-initial"
                        >
                            Ay
                        </Button>
                        <Button
                            variant={view === "timeGridWeek" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => handleViewChange("timeGridWeek")}
                            className="text-xs px-3 flex-1 md:flex-initial"
                        >
                            Hafta
                        </Button>
                        <Button
                            variant={view === "timeGridDay" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => handleViewChange("timeGridDay")}
                            className="text-xs px-3 flex-1 md:flex-initial"
                        >
                            Gün
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="calendar-container p-4 min-h-[700px]">
                        <style jsx global>{`
                        .fc { --fc-border-color: #e2e8f0; --fc-button-bg-color: #ffffff; --fc-button-border-color: #e2e8f0; --fc-button-text-color: #0f172a; --fc-button-hover-bg-color: #f8fafc; --fc-button-hover-border-color: #cbd5e1; --fc-button-active-bg-color: #f1f5f9; --fc-button-active-border-color: #94a3b8; }
                        .fc .fc-toolbar { margin-bottom: 20px !important; }
                        .fc .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 700 !important; color: #1e293b; }
                        .fc .fc-button { text-transform: capitalize !important; font-weight: 500 !important; border-radius: 0.5rem !important; }
                        .fc .fc-button-primary:not(:disabled).fc-button-active, .fc .fc-button-primary:not(:disabled):active { background-color: #f1f5f9 !important; border-color: #94a3b8 !important; color: #0f172a !important; }
                        .fc .fc-col-header-cell-cushion { padding: 12px 4px !important; color: #64748b; font-weight: 600; font-size: 0.875rem; }
                        .fc .fc-daygrid-day-number { padding: 8px !important; color: #475569; font-weight: 500; font-size: 0.8125rem; }
                        .fc .fc-event { border-radius: 4px !important; padding: 2px 4px !important; font-size: 0.75rem !important; font-weight: 500 !important; cursor: pointer; border: none !important; transition: opacity 0.2s; }
                        .fc .fc-event:hover { opacity: 0.85; }
                        .fc .fc-day-today { background-color: rgba(59, 130, 246, 0.05) !important; }
                        .fc-header-toolbar { display: none !important; }
                    `}</style>
                        <FullCalendar
                            ref={calendarRef}
                            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, multiMonthPlugin]}
                            initialView={view}
                            headerToolbar={false}
                            locale={trLocale}
                            events={events}
                            height="auto"
                            selectable={true}
                            editable={true}
                            dayMaxEvents={true}
                            slotMinTime="08:00:00"
                            slotMaxTime="22:00:00"
                            allDaySlot={false}
                            eventClick={handleEventClick}
                            navLinks={true}
                            navLinkDayClick={(date) => {
                                const calendarApi = calendarRef.current?.getApi()
                                if (calendarApi && view === "multiMonthYear") {
                                    calendarApi.gotoDate(date)
                                    handleViewChange("dayGridMonth")
                                } else if (calendarApi) {
                                    calendarApi.gotoDate(date)
                                    handleViewChange("timeGridDay")
                                }
                            }}
                            viewDidMount={(info) => {
                                if (info.view.type !== view) {
                                    setView(info.view.type)
                                }
                            }}
                            datesSet={(dateInfo) => {
                                setTitle(dateInfo.view.title)
                            }}
                        />
                    </div>
                </CardContent>
            </Card>

            {selectedEvent && (
                <EditShootDialog
                    shoot={selectedEvent}
                    customers={customers}
                    companies={companies}
                    employees={employees}
                    inventory={inventory}
                    open={isEditOpen}
                    onOpenChange={setIsEditOpen}
                />
            )}

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            {selectedEvent?.type && (
                                <Badge style={{ backgroundColor: getEventColor(selectedEvent.type) }}>
                                    {selectedEvent.type}
                                </Badge>
                            )}
                            Detaylar
                        </DialogTitle>
                        <DialogDescription>
                            {selectedEvent?.title}
                            {selectedEvent?.company && (
                                <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block ml-2">
                                    {selectedEvent.company.name}
                                </div>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
                                <CalendarIcon className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-slate-500">Tarih</p>
                                <p className="text-sm font-semibold">
                                    {selectedEvent?.startDateTime && format(new Date(selectedEvent.startDateTime), 'd MMMM yyyy, EEEE', { locale: tr })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center text-orange-500">
                                <Clock className="h-4 w-4" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-slate-500">Saat</p>
                                <p className="text-sm font-semibold">
                                    {selectedEvent?.startDateTime && format(new Date(selectedEvent.startDateTime), 'HH:mm', { locale: tr })} -
                                    {selectedEvent?.endDateTime && format(new Date(selectedEvent.endDateTime), 'HH:mm', { locale: tr })}
                                </p>
                            </div>
                        </div>

                        {selectedEvent?.location && (
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center text-green-500">
                                    <MapPin className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-sm font-medium text-slate-500">Konum</p>
                                    <p className="text-sm font-medium">{selectedEvent?.location || "Belirtilmemiş"}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                <User className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium text-slate-500">Görevli Personel</p>
                                <p className="text-sm font-semibold">
                                    {selectedEvent?.staffs && selectedEvent.staffs.length > 0
                                        ? selectedEvent.staffs.map((st: any) => st.name).join(", ")
                                        : "Atanmamış"}
                                </p>
                            </div>
                        </div>

                        {selectedEvent?.notes && (
                            <div className="flex items-start gap-3 mt-2 bg-slate-50 p-3 rounded-lg border">
                                <Info className="h-5 w-5 text-slate-400 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-xs font-medium text-slate-500 uppercase">Notlar & Açıklama</p>
                                    <p className="text-sm text-slate-700">{selectedEvent.notes}</p>
                                </div>
                            </div>
                        )}


                    </div>

                    <DialogFooter className="gap-2">
                        <Button variant="outline" onClick={() => setIsEditOpen(true)}>Düzenle</Button>
                        <Button onClick={() => window.location.href = `/shoots/${selectedEvent?.id}`}>Detaya Git</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
