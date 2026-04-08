"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/firebase"
import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    orderBy,
    serverTimestamp,
    Timestamp
} from "firebase/firestore"

export async function createCustomer(formData: any) {
    try {
        const customerData = {
            ...formData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }

        const docRef = await addDoc(collection(db, "Customer"), customerData)

        revalidatePath("/customers")
        revalidatePath("/shoots")
        revalidatePath("/calendar")
        revalidatePath("/finance")
        revalidatePath("/dashboard")

        return {
            success: true,
            customer: { ...formData, id: docRef.id }
        }
    } catch (error: any) {
        console.error("Customer creation error:", error)
        return { success: false, error: error.message }
    }
}

export async function getCustomers(searchQuery?: string) {
    try {
        const customersRef = collection(db, "Customer")
        let q = query(customersRef, orderBy("createdAt", "desc"))

        const querySnapshot = await getDocs(q)
        let customers = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }))

        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase()
            customers = customers.filter((c: any) => 
                (c.name?.toLowerCase() || "").includes(searchLower) ||
                (c.phone || "").includes(searchLower) ||
                (c.email?.toLowerCase() || "").includes(searchLower)
            )
        }

        // Serialize timestamps for Next.js
        return JSON.parse(JSON.stringify(customers))
    } catch (error) {
        console.error("Get customers error:", error)
        return []
    }
}

export async function deleteCustomer(customerId: string) {
    try {
        await deleteDoc(doc(db, "Customer", customerId))

        revalidatePath("/customers")
        revalidatePath("/shoots")
        revalidatePath("/calendar")
        revalidatePath("/finance")
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error: any) {
        console.error("Customer deletion error:", error)
        return { success: false, error: error.message }
    }
}


