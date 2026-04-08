"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/firebase"
import { 
    collection, 
    addDoc, 
    getDoc, 
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
function serializeDoc(data: any) {
    if (!data) return data;
    const serialized = { ...data };
    
    for (const key in serialized) {
        const value = serialized[key];
        if (value instanceof Timestamp) {
            serialized[key] = value.toDate().toISOString();
        } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            serialized[key] = serializeDoc(value);
        } else if (Array.isArray(value)) {
            serialized[key] = value.map(item => typeof item === 'object' ? serializeDoc(item) : item);
        }
    }
    return serialized;
}

export async function createShoot(formData: any) {
    try {
        const shootData = {
            ...formData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }

        const docRef = await addDoc(collection(db, "Shoot"), shootData)

        // If there is an initial deposit, record it in finance
        if (formData.deposit && Number(formData.deposit) > 0) {
            try {
                await addDoc(collection(db, "Transaction"), {
                    type: "INCOME",
                    amount: Number(formData.deposit),
                    category: "Çekim Ödemesi (Kapora)",
                    description: `${formData.title || "Yeni Çekim"} için alınan ilk kapora`,
                    date: new Date().toISOString(),
                    relatedId: docRef.id,
                    createdAt: serverTimestamp()
                })
            } catch (e) {
                console.warn("Could not record initial finance transaction:", e)
            }
        }

        revalidatePath("/calendar")
        revalidatePath("/shoots")
        revalidatePath("/dashboard")
        revalidatePath("/finance")

        return {
            success: true,
            shoot: { ...formData, id: docRef.id }
        }
    } catch (error: any) {
        console.error("Shoot creation error:", error)
        return { success: false, error: error.message }
    }
}


export async function getShoots(searchQuery?: string) {
    try {
        const shootsRef = collection(db, "Shoot")
        const q = query(shootsRef, orderBy("startDateTime", "desc"))
        const querySnapshot = await getDocs(q)
        
        const shoots = querySnapshot.docs.map(doc => serializeDoc({
            ...doc.data(),
            id: doc.id
        }))

        return JSON.parse(JSON.stringify(shoots))
    } catch (error) {
        console.error("Get shoots error:", error)
        return []
    }
}

export async function getShoot(id: string) {
    try {
        const docRef = doc(db, "Shoot", id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const data = docSnap.data()
            return JSON.parse(JSON.stringify(serializeDoc({ ...data, id: docSnap.id })))
        } else {
            return null
        }
    } catch (error) {
        console.error("Get shoot error:", error)
        return null
    }
}


export async function deleteShoot(id: string) {
    try {
        await deleteDoc(doc(db, "Shoot", id))

        revalidatePath("/calendar")
        revalidatePath("/shoots")
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error: any) {
        console.error("Shoot deletion error:", error)
        return { success: false, error: error.message }
    }
}

export async function updateShoot(id: string, formData: any) {
    try {
        const shootRef = doc(db, "Shoot", id)
        await updateDoc(shootRef, {
            ...formData,
            updatedAt: serverTimestamp()
        })

        revalidatePath("/calendar")
        revalidatePath("/shoots")
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error: any) {
        console.error("Shoot update error:", error)
        return { success: false, error: error.message }
    }
}

export async function recordPayment(shootId: string, amount: number, note?: string) {
    try {
        const shootRef = doc(db, "Shoot", shootId)
        const docSnap = await getDoc(shootRef)
        
        if (!docSnap.exists()) throw new Error("Shoot not found")
        
        const currentDeposit = docSnap.data().deposit || 0
        const newDeposit = currentDeposit + amount

        await updateDoc(shootRef, {
            deposit: newDeposit,
            updatedAt: serverTimestamp()
        })

        // Also record a transaction in the finance collection if it exists
        try {
            await addDoc(collection(db, "Transaction"), {
                type: "INCOME",
                amount: amount,
                category: "Çekim Ödemesi",
                description: note || "Tahsilat yapıldı",
                date: new Date().toISOString(),
                relatedId: shootId,
                createdAt: serverTimestamp()
            })
        } catch (e) {
            console.warn("Could not record finance transaction:", e)
        }

        revalidatePath(`/shoots/${shootId}`)
        revalidatePath("/shoots")
        revalidatePath("/finance")
        revalidatePath("/dashboard")
        return { success: true, newDeposit }
    } catch (error: any) {
        console.error("Record payment error:", error)
        return { success: false, error: error.message }
    }
}

export async function updateShootPrice(shootId: string, newPrice: number) {
    try {
        const shootRef = doc(db, "Shoot", shootId)
        await updateDoc(shootRef, {
            totalPrice: newPrice,
            updatedAt: serverTimestamp()
        })
        revalidatePath(`/shoots/${shootId}`)
        return { success: true }
    } catch (error: any) {
        console.error("Update price error:", error)
        return { success: false, error: error.message }
    }
}

export async function toggleDeliveryStatus(shootId: string, currentStatus: string) {
    try {
        const newStatus = currentStatus === "DELIVERED" ? "COMPLETED" : "DELIVERED"
        const shootRef = doc(db, "Shoot", shootId)
        await updateDoc(shootRef, {
            status: newStatus,
            updatedAt: serverTimestamp()
        })
        revalidatePath("/deliveries")
        return { success: true, newStatus }
    } catch (error: any) {
        console.error("Toggle delivery status error:", error)
        return { success: false, error: error.message }
    }
}




