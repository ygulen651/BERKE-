import { NextResponse } from "next/server"
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
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

        // Create user in Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        const user = userCredential.user

        // Update profile with name
        await updateProfile(user, { displayName: name })

        // Save user details in Firestore
        await setDoc(doc(db, "User", user.uid), {
            name,
            email,
            role: "EMPLOYEE", // Default role
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        })

        revalidatePath("/employees")

        return NextResponse.json(
            { user: { name, email, id: user.uid }, message: "Kayıt başarılı." },
            { status: 201 }
        )


    } catch (error: any) {
        console.error("Registration error:", error)
        let message = "Bir hata oluştu. Lütfen tekrar deneyin."
        if (error.code === "auth/email-already-in-use") {
            message = "bu e-posta adresi zaten kullanımda."
        }
        return NextResponse.json(
            { message },
            { status: 500 }
        )
    }
}


