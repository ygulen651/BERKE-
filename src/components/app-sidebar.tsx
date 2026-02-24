"use client"

import {
    Calendar,
    Camera,
    CreditCard,
    LayoutDashboard,
    LogOut,
    Users,
    CheckSquare,
    UserCircle,
    Package,
    Truck,
    Building2,
} from "lucide-react"

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarGroupContent,
} from "@/components/ui/sidebar"
import Link from "next/link"
import Image from "next/image"
import { signOut, useSession } from "next-auth/react"

const allMenuItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, adminOnly: false },
    { title: "Takvim", url: "/calendar", icon: Calendar, adminOnly: false },
    { title: "Görevler", url: "/tasks", icon: CheckSquare, adminOnly: false },
    { title: "Çekimler", url: "/shoots", icon: Camera, adminOnly: true },
    { title: "Müşteriler", url: "/customers", icon: Users, adminOnly: true },
    { title: "Personel", url: "/employees", icon: UserCircle, adminOnly: true },
    { title: "Stok Yönetimi", url: "/inventory", icon: Package, adminOnly: true },
    { title: "Finans", url: "/finance", icon: CreditCard, adminOnly: true },
    { title: "Teslimat & Firmalar", url: "/deliveries", icon: Truck, adminOnly: false },
]

export function AppSidebar() {
    const { data: session, status } = useSession()
    // Loading sırasında tüm menüyü göster (flash önleme)
    const isAdmin = status === "loading" ? true : session?.user?.role === "ADMIN"

    const menuItems = allMenuItems.filter(item => !item.adminOnly || isAdmin)

    return (
        <Sidebar>
            <SidebarHeader className="p-0 border-b bg-white">
                <div className="flex items-center justify-center w-full">
                    <div className="relative w-full h-64 transform hover:scale-105 transition-transform duration-500">
                        <Image
                            src="/YENİ LOGO SİYAH PNG.png"
                            alt="Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menü</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {menuItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild tooltip={item.title}>
                                        <Link href={item.url} className="flex items-center gap-3">
                                            <item.icon className="w-5 h-5" />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="p-4 border-t">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => signOut({ callbackUrl: "/login" })}
                        >
                            <LogOut className="w-5 h-5 mr-3" />
                            <span>Çıkış Yap</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
                {session?.user && (
                    <div className="mt-3 pt-3 border-t text-center space-y-1">
                        <p className="text-xs font-semibold text-slate-700">{session.user.name}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${isAdmin ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"}`}>
                            {isAdmin ? "Yönetici" : "Personel"}
                        </span>
                    </div>
                )}
                <div className="mt-4 pt-4 border-t text-center">
                    <Link
                        href="https://www.yusufgulenmedya.com.tr/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-slate-900 hover:text-blue-600 transition-colors"
                    >
                        Yusuf Gülen Medya Tarafından Yapılmıştır
                    </Link>
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
