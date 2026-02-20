"use server"

import { getDb, jsonify } from "@/lib/mongodb"
import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"

export async function getInventory() {
    try {
        const db = await getDb()
        const items = await db.collection("Inventory").find({}).sort({ type: 1, name: 1 }).toArray()
        const serialized = items.map(item => ({
            ...item,
            id: item._id.toString(),
            _id: item._id.toString()
        }))
        return jsonify(serialized)
    } catch (error) {
        console.error("Get inventory error:", error)
        return []
    }
}

export async function updateInventoryQuantity(id: string, amount: number) {
    try {
        const db = await getDb()
        await db.collection("Inventory").updateOne(
            { _id: new ObjectId(id) },
            {
                $inc: { quantity: amount },
                $set: { updatedAt: new Date() }
            }
        )
        revalidatePath("/inventory")
        revalidatePath("/shoots")
        revalidatePath("/calendar")
        return { success: true }
    } catch (error: any) {
        console.error("Update inventory error:", error)
        return { success: false, error: error.message }
    }
}

export async function createInventoryItem(data: { name: string, type: 'FRAME' | 'PAPER', size: string, quantity: number }) {
    try {
        const db = await getDb()
        const newItem = {
            ...data,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        await db.collection("Inventory").insertOne(newItem)
        revalidatePath("/inventory")
        revalidatePath("/shoots")
        revalidatePath("/calendar")
        return { success: true }
    } catch (error: any) {
        console.error("Create inventory error:", error)
        return { success: false, error: error.message }
    }
}

export async function deleteInventoryItem(id: string) {
    try {
        const db = await getDb()
        await db.collection("Inventory").deleteOne({ _id: new ObjectId(id) })
        revalidatePath("/inventory")
        revalidatePath("/shoots")
        revalidatePath("/calendar")
        return { success: true }
    } catch (error: any) {
        console.error("Delete inventory error:", error)
        return { success: false, error: error.message }
    }
}

export async function seedDefaultInventory() {
    try {
        const db = await getDb()
        const count = await db.collection("Inventory").countDocuments()

        if (count === 0) {
            const defaults = [
                { name: "10x15 Çerçeve", type: "FRAME", size: "10x15", quantity: 0 },
                { name: "15x21 Çerçeve", type: "FRAME", size: "15x21", quantity: 0 },
                { name: "20x30 Çerçeve", type: "FRAME", size: "20x30", quantity: 0 },
                { name: "30x40 Çerçeve", type: "FRAME", size: "30x40", quantity: 0 },
                { name: "15x21 Plastik Çerçeve", type: "FRAME", size: "15x21", quantity: 0 },
                { name: "10x15 Fotoğraf Kağıdı", type: "PAPER", size: "10x15", quantity: 0 },
                { name: "15x21 Fotoğraf Kağıdı", type: "PAPER", size: "15x21", quantity: 0 },
            ].map(item => ({ ...item, createdAt: new Date(), updatedAt: new Date() }))

            await db.collection("Inventory").insertMany(defaults)
            revalidatePath("/inventory")
            return { success: true, message: "Varsayılan stoklar eklendi." }
        }
        return { success: true, message: "Stoklar zaten mevcut." }
    } catch (error: any) {
        console.error("Seed inventory error:", error)
        return { success: false, error: error.message }
    }
}
