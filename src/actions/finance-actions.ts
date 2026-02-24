"use server"

import { getDb, jsonify } from "@/lib/mongodb"
import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"

export async function createTransaction(formData: any) {
    try {
        const db = await getDb()
        const { relatedIds, ...baseData } = formData
        const baseTransaction = {
            ...baseData,
            amount: parseFloat(baseData.amount),
            date: baseData.date ? new Date(baseData.date) : new Date(),
            createdAt: new Date(),
            shootId: baseData.shootId ? new ObjectId(baseData.shootId) : null,
        }

        if (relatedIds && Array.isArray(relatedIds) && relatedIds.length > 0) {
            const records = relatedIds.map((id: string) => ({
                ...baseTransaction,
                relatedId: new ObjectId(id)
            }))
            await db.collection("Transaction").insertMany(records)
        } else {
            const transactionData = {
                ...baseTransaction,
                relatedId: baseData.relatedId ? new ObjectId(baseData.relatedId) : null
            }
            await db.collection("Transaction").insertOne(transactionData)
        }

        revalidatePath("/finance")
        revalidatePath("/dashboard")

        return jsonify({
            success: true
        })
    } catch (error: any) {
        console.error("Transaction creation error:", error)
        return { success: false, error: error.message }
    }
}

export async function getTransactions() {
    try {
        const db = await getDb()
        const transactions = await db.collection("Transaction").aggregate([
            {
                $lookup: {
                    from: "User",
                    localField: "relatedId",
                    foreignField: "_id",
                    as: "relatedUser"
                }
            },
            {
                $lookup: {
                    from: "Shoot",
                    localField: "relatedId",
                    foreignField: "_id",
                    as: "relatedShoot"
                }
            },
            {
                $unwind: {
                    path: "$relatedShoot",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "Customer",
                    localField: "relatedShoot.customerId",
                    foreignField: "_id",
                    as: "relatedCustomer"
                }
            },
            {
                $unwind: {
                    path: "$relatedUser",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $unwind: {
                    path: "$relatedCustomer",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $sort: { date: -1 }
            }
        ]).toArray()

        const serialized = transactions.map(t => {
            let relatedName = null
            if (t.relatedUser) {
                relatedName = t.relatedUser.name
            } else if (t.relatedCustomer) {
                relatedName = `${t.relatedCustomer.name} (Çekim)`
            }

            return {
                ...t,
                id: t._id.toString(),
                _id: t._id.toString(),
                relatedName: relatedName
            }
        })
        return jsonify(serialized)
    } catch (error) {
        console.error("Get transactions error:", error)
        return []
    }
}

export async function getFinanceStats() {
    try {
        const db = await getDb()
        const transactions = await db.collection("Transaction").find({}).toArray()
        const shoots = await db.collection("Shoot").find({}).toArray()

        const totalIncome = transactions
            .filter(t => t.type === "INCOME")
            .reduce((acc, t) => acc + (t.amount || 0), 0)

        const totalExpense = transactions
            .filter(t => t.type === "EXPENSE")
            .reduce((acc, t) => acc + (t.amount || 0), 0)

        const totalProjectedRevenue = shoots.reduce((acc, s) => acc + (parseFloat(s.totalPrice) || 0), 0)
        const totalRemainingBalance = totalProjectedRevenue - totalIncome

        return {
            totalIncome,
            totalExpense,
            balance: totalIncome - totalExpense,
            totalProjectedRevenue,
            totalRemainingBalance
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

export async function updateTransaction(id: string, formData: any) {
    try {
        const db = await getDb()
        const updateData = {
            ...formData,
            amount: parseFloat(formData.amount),
            date: formData.date ? new Date(formData.date) : new Date(),
            updatedAt: new Date(),
            relatedId: formData.relatedId ? new ObjectId(formData.relatedId) : null,
            shootId: formData.shootId ? new ObjectId(formData.shootId) : null,
        }

        // Remove ID from updated data to avoid Mongo error
        delete (updateData as any).id
        delete (updateData as any)._id

        await db.collection("Transaction").updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        )

        revalidatePath("/finance")
        revalidatePath("/dashboard")

        return { success: true }
    } catch (error: any) {
        console.error("Transaction update error:", error)
        return { success: false, error: error.message }
    }
}

export async function deleteTransaction(id: string) {
    try {
        const db = await getDb()
        await db.collection("Transaction").deleteOne({ _id: new ObjectId(id) })

        revalidatePath("/finance")
        revalidatePath("/dashboard")

        return { success: true }
    } catch (error: any) {
        console.error("Transaction deletion error:", error)
        return { success: false, error: error.message }
    }
}
