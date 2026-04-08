import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    CheckCircle2,
    Circle,
    Clock,
    UserCircle,
    MoreVertical,
    Trash2
} from "lucide-react"
import { getTasks, deleteTask } from "@/actions/task-actions"
import { getEmployees } from "@/actions/employee-actions"
import { AddTaskDialog } from "@/components/add-task-dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

export default async function TasksPage() {
    const tasks = await getTasks()
    const employees = await getEmployees()

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Görevler</h2>
                    <p className="text-muted-foreground">Ekip görevlerini ve iş akışını takip edin.</p>
                </div>
                <AddTaskDialog employees={employees} />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Yapılacaklar */}
                <Card className="bg-slate-50/50 border-dashed min-h-[500px]">
                    <CardHeader className="pb-3 text-center border-b mb-4">
                        <CardTitle className="text-sm font-medium flex items-center justify-center gap-2">
                            <Circle className="w-4 h-4 text-slate-400" />
                            Yapılacaklar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(tasks as any[]).filter(t => t.status === "TODO").length === 0 ? (
                            <p className="text-center text-xs text-muted-foreground py-8">Görev yok</p>
                        ) : (
                            (tasks as any[]).filter(t => t.status === "TODO").map((task: any) => (
                                <TaskCard key={task.id} task={task} />
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Devam Edenler */}
                <Card className="bg-blue-50/20 border-blue-100 min-h-[500px]">
                    <CardHeader className="pb-3 text-center border-b mb-4">
                        <CardTitle className="text-sm font-medium flex items-center justify-center gap-2">
                            <Clock className="w-4 h-4 text-blue-500" />
                            Devam Edenler
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(tasks as any[]).filter(t => t.status === "IN_PROGRESS").length === 0 ? (
                            <p className="text-center text-xs text-muted-foreground py-8">Görev yok</p>
                        ) : (
                            (tasks as any[]).filter(t => t.status === "IN_PROGRESS").map((task: any) => (
                                <TaskCard key={task.id} task={task} />
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Tamamlananlar */}
                <Card className="bg-green-50/20 border-green-100 min-h-[500px]">
                    <CardHeader className="pb-3 text-center border-b mb-4">
                        <CardTitle className="text-sm font-medium flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-500" />
                            Tamamlananlar
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {(tasks as any[]).filter(t => t.status === "COMPLETED").length === 0 ? (
                            <p className="text-center text-xs text-muted-foreground py-8">Görev yok</p>
                        ) : (
                            (tasks as any[]).filter(t => t.status === "COMPLETED").map((task: any) => (
                                <TaskCard key={task.id} task={task} />
                            ))
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

function TaskCard({ task }: { task: any }) {
    const priorityColors: Record<string, string> = {
        URGENT: "text-red-700 bg-red-200",
        HIGH: "text-red-600 bg-red-100",
        MEDIUM: "text-amber-600 bg-amber-100",
        LOW: "text-slate-600 bg-slate-100"
    }

    return (
        <Card className="shadow-sm border-none bg-white p-3 space-y-3 hover:shadow-md transition-shadow relative">
            <div className="flex items-start justify-between gap-2 mr-6">
                <div className="space-y-1">
                    <h4 className="text-sm font-semibold leading-tight">{task.title}</h4>
                    {task.type && task.type !== "Genel" && (
                        <Badge variant="outline" className="text-[10px] px-1 h-4 font-normal text-slate-500">
                            {task.type}
                        </Badge>
                    )}
                </div>
                <Badge className={`text-[10px] px-1.5 h-5 shadow-none border-0 ${priorityColors[task.priority]}`}>
                    {task.priority}
                </Badge>
            </div>

            <div className="absolute top-2 right-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <form action={async () => {
                            "use server"
                            await deleteTask(task.id)
                        }}>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600 cursor-pointer">
                                <button type="submit" className="flex items-center w-full">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Görevi Sil
                                </button>
                            </DropdownMenuItem>
                        </form>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                    <UserCircle className="w-3.5 h-3.5" />
                    {task.assignee?.name}
                </div>
                <div className="font-medium text-slate-500">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString("tr-TR") : "Süresiz"}
                </div>
            </div>
        </Card>
    )
}
