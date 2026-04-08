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
    increment,
    serverTimestamp,
    orderBy,
    query
} from "firebase/firestore"

export async function getInventory() {
    try {
        const inventoryRef = collection(db, "Inventory")
        const q = query(inventoryRef, orderBy("name"))
        const querySnapshot = await getDocs(q)
        const inventory = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }))
        return JSON.parse(JSON.stringify(inventory))
    } catch (error) {
        console.error("Get inventory error:", error)
        return []
    }
}

export async function updateInventoryQuantity(id: string, amount: number) {
    try {
        const itemRef = doc(db, "Inventory", id)
        await updateDoc(itemRef, {
            quantity: increment(amount),
            updatedAt: serverTimestamp()
        })
        revalidatePath("/inventory")
        return { success: true }
    } catch (error: any) {
        console.error("Update inventory error:", error)
        return { success: false, error: error.message }
    }
}

export async function createInventoryItem(data: { name: string, type: 'FRAME' | 'PAPER', size: string, quantity: number }) {
    try {
        const itemData = {
            ...data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        }
        await addDoc(collection(db, "Inventory"), itemData)
        revalidatePath("/inventory")
        return { success: true }
    } catch (error: any) {
        console.error("Create inventory error:", error)
        return { success: false, error: error.message }
    }
}

export async function deleteInventoryItem(id: string) {
    try {
        await deleteDoc(doc(db, "Inventory", id))
        revalidatePath("/inventory")
        return { success: true }
    } catch (error: any) {
        console.error("Delete inventory error:", error)
        return { success: false, error: error.message }
    }
}

export async function seedDefaultInventory() {
    try {
        const defaultItems = [
            { name: "10x15 Çerçeve", type: "FRAME", size: "10x15", quantity: 50 },
            { name: "15x21 Çerçeve", type: "FRAME", size: "15x21", quantity: 30 },
            { name: "20x30 Çerçeve", type: "FRAME", size: "20x30", quantity: 20 },
            { name: "30x40 Çerçeve", type: "FRAME", size: "30x40", quantity: 15 },
            { name: "15x21 Plastik Çerçeve", type: "FRAME", size: "15x21", quantity: 40 },
            { name: "10x15 Fotoğraf Kağıdı", type: "PAPER", size: "10x15", quantity: 200 },
            { name: "15x21 Fotoğraf Kağıdı", type: "PAPER", size: "15x21", quantity: 150 },
        ]

        const inventoryRef = collection(db, "Inventory")
        const existing = await getDocs(inventoryRef)
        
        if (existing.empty) {
            for (const item of defaultItems) {
                await addDoc(inventoryRef, {
                    ...item,
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp()
                })
            }
            revalidatePath("/inventory")
            return { success: true, message: "Stoklar başarıyla oluşturuldu." }
        }
        
        return { success: true, message: "Stoklar zaten mevcut." }
    } catch (error: any) {
        console.error("Seed inventory error:", error)
        return { success: false, error: error.message }
    }
}


