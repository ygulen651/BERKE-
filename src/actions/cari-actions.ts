"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/firebase"
import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    updateDoc,
    query, 
    orderBy,
    serverTimestamp,
    Timestamp
} from "firebase/firestore"

// Helper to convert Firestore Timestamps to ISO strings
function serializeDoc(data: Record<string, any>): Record<string, any> {
    if (!data) return data;
    const serialized = { ...data };
    
    for (const key in serialized) {
        const value = serialized[key];
        if (value instanceof Timestamp) {
            serialized[key] = value.toDate().toISOString();
        } else if (value && typeof value === 'object') {
            // Check if it's a Firestore FieldValue (e.g. serverTimestamp() placeholder in local cache)
            if ('_methodName' in value || value.constructor?.name?.includes('FieldValue')) {
                serialized[key] = new Date().toISOString();
            } else if (!Array.isArray(value)) {
                serialized[key] = serializeDoc(value);
            } else {
                serialized[key] = value.map((item: any) => 
                    (item && typeof item === 'object' && !Array.isArray(item)) 
                        ? serializeDoc(item) 
                        : item
                );
            }
        }
    }
    return serialized;
}

function getTurkishDateParts(dateStr: string) {
    // dateStr format: YYYY-MM-DD
    const [year, month, day] = dateStr.split("-").map(Number)
    const date = new Date(year, month - 1, day)
    const monthName = date.toLocaleDateString("tr-TR", { month: "long" })
    const dayName = date.toLocaleDateString("tr-TR", { weekday: "long" })
    return { month: monthName, day: dayName }
}

export async function createCariRecord(data: {
    date: string // YYYY-MM-DD
    shoots: string
    totalAmount: number
    paidAmount: number
    description?: string
    companyId?: string | null
    companyName?: string | null
}) {
    try {
        const { month, day } = getTurkishDateParts(data.date)
        const total = Number(data.totalAmount) || 0
        const paid = Number(data.paidAmount) || 0
        const remaining = Math.max(0, total - paid)

        const recordData = {
            date: data.date,
            month,
            day,
            shoots: data.shoots,
            totalAmount: total,
            paidAmount: paid,
            remainingAmount: remaining,
            description: data.description || "",
            companyId: data.companyId || null,
            companyName: data.companyName || null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }

        const docRef = await addDoc(collection(db, "Cari"), recordData)

        revalidatePath("/cari")
        revalidatePath("/dashboard")
        revalidatePath("/finance")

        const serializedRecord = serializeDoc({ ...recordData, id: docRef.id })

        return JSON.parse(JSON.stringify({
            success: true,
            record: serializedRecord
        }))
    } catch (error: any) {
        console.error("Cari record creation error:", error)
        return { success: false, error: error.message }
    }
}

export async function getCariRecords() {
    try {
        const cariRef = collection(db, "Cari")
        const q = query(cariRef, orderBy("date", "desc"))
        const querySnapshot = await getDocs(q)
        
        const records = querySnapshot.docs.map(doc => {
            const data = doc.data()
            const serialized = serializeDoc({
                ...data,
                id: doc.id
            })

            // Normalize old/new data fields
            const total = serialized.totalAmount !== undefined ? Number(serialized.totalAmount) : (Number(serialized.amount) || 0)
            const paid = serialized.paidAmount !== undefined ? Number(serialized.paidAmount) : 0
            const remaining = serialized.remainingAmount !== undefined ? Number(serialized.remainingAmount) : Math.max(0, total - paid)

            return {
                ...serialized,
                totalAmount: total,
                paidAmount: paid,
                remainingAmount: remaining
            }
        })

        return JSON.parse(JSON.stringify(records))
    } catch (error) {
        console.error("Get cari records error:", error)
        return []
    }
}

export async function deleteCariRecord(id: string) {
    try {
        await deleteDoc(doc(db, "Cari", id))

        revalidatePath("/cari")
        revalidatePath("/dashboard")
        revalidatePath("/finance")
        return { success: true }
    } catch (error: any) {
        console.error("Cari record deletion error:", error)
        return { success: false, error: error.message }
    }
}

export async function updateCariRecord(
    id: string,
    data: {
        date: string // YYYY-MM-DD
        shoots: string
        totalAmount: number
        paidAmount: number
        description?: string
        companyId?: string | null
        companyName?: string | null
    }
) {
    try {
        const { month, day } = getTurkishDateParts(data.date)
        const total = Number(data.totalAmount) || 0
        const paid = Number(data.paidAmount) || 0
        const remaining = Math.max(0, total - paid)

        const recordRef = doc(db, "Cari", id)
        const updateData = {
            date: data.date,
            month,
            day,
            shoots: data.shoots,
            totalAmount: total,
            paidAmount: paid,
            remainingAmount: remaining,
            description: data.description || "",
            companyId: data.companyId || null,
            companyName: data.companyName || null,
            updatedAt: serverTimestamp(),
        }

        await updateDoc(recordRef, updateData)

        revalidatePath("/cari")
        revalidatePath("/dashboard")
        revalidatePath("/finance")

        const serialized = serializeDoc({ ...updateData, id })

        return JSON.parse(JSON.stringify({
            success: true,
            record: serialized
        }))
    } catch (error: any) {
        console.error("Cari record update error:", error)
        return { success: false, error: error.message }
    }
}
