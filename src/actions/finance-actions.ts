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
} from "firebase/firestore"


export async function createTransaction(formData: Record<string, unknown>) {
    try {
        const transactionData = {
            ...formData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }

        await addDoc(collection(db, "Transaction"), transactionData)

        revalidatePath("/finance")
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error: unknown) {
        console.error("Transaction creation error:", error)
        return { success: false, error: error instanceof Error ? error.message : "Bilinmeyen hata" }
    }
}


export async function getTransactions() {
    try {
        const transactionsRef = collection(db, "Transaction")
        const q = query(transactionsRef, orderBy("date", "desc"))
        const querySnapshot = await getDocs(q)
        
        const transactions = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }))

        // Serialize timestamps for Next.js
        return JSON.parse(JSON.stringify(transactions))
    } catch (error) {
        console.error("Get transactions error:", error)
        return []
    }
}

export async function getFinanceStats() {
    try {
        const transactionsRef = collection(db, "Transaction")
        const querySnapshot = await getDocs(transactionsRef)
        
        let totalIncome = 0
        let totalExpense = 0
        
        querySnapshot.docs.forEach(doc => {
            const data = doc.data()
            if (data.type === "INCOME") {
                totalIncome += Number(data.amount) || 0
            } else if (data.type === "EXPENSE") {
                totalExpense += Number(data.amount) || 0
            }
        })

        // Also fetch shoots for projected revenue
        const shootsSnapshot = await getDocs(collection(db, "Shoot"))
        let totalProjectedRevenue = 0
        let totalReceivedFromShoots = 0

        shootsSnapshot.docs.forEach(doc => {
            const data = doc.data()
            totalProjectedRevenue += Number(data.totalPrice) || 0
            totalReceivedFromShoots += Number(data.deposit) || 0
        })

        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            totalProjectedRevenue,
            totalRemainingBalance: totalProjectedRevenue - totalReceivedFromShoots
        }
    } catch (error) {
        console.error("Get finance stats error:", error)
        return {
            totalIncome: 0,
            totalExpense: 0,
            balance: 0,
            totalProjectedRevenue: 0,
            totalRemainingBalance: 0
        }
    }
}

export async function updateTransaction(id: string, formData: Record<string, unknown>) {
    try {
        const transactionRef = doc(db, "Transaction", id)
        await updateDoc(transactionRef, {
            ...formData,
            updatedAt: serverTimestamp()
        })
        revalidatePath("/finance")
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error: unknown) {
        console.error("Transaction update error:", error)
        return { success: false, error: error instanceof Error ? error.message : "Bilinmeyen hata" }
    }
}


export async function deleteTransaction(id: string) {
    try {
        await deleteDoc(doc(db, "Transaction", id))
        revalidatePath("/finance")
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error: unknown) {
        console.error("Transaction deletion error:", error)
        return { success: false, error: error instanceof Error ? error.message : "Bilinmeyen hata" }
    }
}



