import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { getDb } from "@/lib/mongodb"
import { revalidatePath } from "next/cache"

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { name, email, password } = body

        if (!email || !password || !name) {
            return NextResponse.json(
                { message: "Eksik bilgi girdiniz." },
                { status: 400 }
            )
        }

        const db = await getDb()
        const normalizedEmail = email.toLowerCase()

        // Check if user exists in 'User' collection
        const existingUser = await db.collection("User").findOne({ email: normalizedEmail })

        if (existingUser) {
            return NextResponse.json(
                { message: "Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var." },
                { status: 409 }
            )
        }

        const hashedPassword = await hash(password, 10)

        // Create new user
        const newUser = {
            name,
            email: normalizedEmail,
            passwordHash: hashedPassword,
            role: "EMPLOYEE", // Default role
            createdAt: new Date(),
            updatedAt: new Date()
        }

        await db.collection("User").insertOne(newUser)
        revalidatePath("/employees")

        // Remove password from response
        const { passwordHash, ...userWithoutPassword } = newUser

        return NextResponse.json(
            { user: userWithoutPassword, message: "Kayıt başarılı." },
            { status: 201 }
        )

    } catch (error) {
        console.error("Registration error:", error)
        return NextResponse.json(
            { message: "Bir hata oluştu. Lütfen tekrar deneyin." },
            { status: 500 }
        )
    }
}
