"use server"

import { getDb, jsonify } from "@/lib/mongodb"
import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"

export async function createShoot(formData: any) {
    try {
        const db = await getDb()
        const shootData = {
            ...formData,
            status: "PLANNED",
            createdAt: new Date(),
            updatedAt: new Date(),
            customerId: new ObjectId(formData.customerId),
            staffIds: (formData.staffIds || []).map((id: string) => new ObjectId(id))
        }

        const result = await db.collection("Shoot").insertOne(shootData)

        revalidatePath("/calendar")
        revalidatePath("/shoots")
        revalidatePath("/dashboard")

        return jsonify({
            success: true,
            shoot: { ...shootData, id: result.insertedId.toString() }
        })
    } catch (error: any) {
        console.error("Shoot creation error:", error)
        return { success: false, error: error.message }
    }
}

export async function getShoots(searchQuery?: string) {
    try {
        const db = await getDb()
        const pipeline: any[] = [
            {
                $lookup: {
                    from: "Customer",
                    let: { custId: "$customerId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ["$_id", "$$custId"] },
                                        { $eq: ["$_id", { $toObjectId: "$$custId" }] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "customerInfo"
                }
            },
            {
                $lookup: {
                    from: "User",
                    let: { staff_ids: { $ifNull: ["$staffIds", []] } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", {
                                        $map: {
                                            input: "$$staff_ids",
                                            as: "id",
                                            in: {
                                                $cond: [
                                                    { $eq: [{ $type: "$$id" }, "string"] },
                                                    { $toObjectId: "$$id" },
                                                    "$$id"
                                                ]
                                            }
                                        }
                                    }]
                                }
                            }
                        }
                    ],
                    as: "staffsInfo"
                }
            },
            {
                $unwind: {
                    path: "$customerInfo",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]

        if (searchQuery) {
            pipeline.push({
                $match: {
                    $or: [
                        { title: { $regex: searchQuery, $options: "i" } },
                        { "customerInfo.name": { $regex: searchQuery, $options: "i" } },
                        { type: { $regex: searchQuery, $options: "i" } }
                    ]
                }
            })
        }

        pipeline.push({
            $sort: {
                startDateTime: 1
            }
        })

        const shoots = await db.collection("Shoot").aggregate(pipeline).toArray()

        const serialized = shoots.map(s => ({
            ...s,
            id: s._id.toString(),
            _id: s._id.toString(),
            customer: s.customerInfo ? {
                ...s.customerInfo,
                id: s.customerInfo._id.toString(),
                _id: s.customerInfo._id.toString(),
            } : null,
            staffs: (s.staffsInfo || []).map((st: any) => ({
                ...st,
                id: st._id.toString(),
                _id: st._id.toString(),
            }))
        }))
        return jsonify(serialized)
    } catch (error) {
        console.error("Get shoots error:", error)
        return []
    }
}

export async function getShoot(id: string) {
    try {
        const db = await getDb()
        const shoots = await db.collection("Shoot").aggregate([
            {
                $match: { _id: new ObjectId(id) }
            },
            {
                $lookup: {
                    from: "Customer",
                    let: { custId: "$customerId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $or: [
                                        { $eq: ["$_id", "$$custId"] },
                                        { $eq: ["$_id", { $cond: [{ $eq: [{ $type: "$$custId" }, "string"] }, { $toObjectId: "$$custId" }, "$$custId"] }] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: "customerInfo"
                }
            },
            {
                $lookup: {
                    from: "User",
                    let: { staff_ids: { $ifNull: ["$staffIds", []] } },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $in: ["$_id", {
                                        $map: {
                                            input: "$$staff_ids",
                                            as: "id",
                                            in: {
                                                $cond: [
                                                    { $eq: [{ $type: "$$id" }, "string"] },
                                                    { $toObjectId: "$$id" },
                                                    "$$id"
                                                ]
                                            }
                                        }
                                    }]
                                }
                            }
                        }
                    ],
                    as: "staffsInfo"
                }
            },
            {
                $unwind: {
                    path: "$customerInfo",
                    preserveNullAndEmptyArrays: true
                }
            }
        ]).toArray()

        if (shoots.length === 0) return null

        const s = shoots[0]
        const serialized = {
            ...s,
            id: s._id.toString(),
            _id: s._id.toString(),
            customer: s.customerInfo ? {
                ...s.customerInfo,
                id: s.customerInfo._id.toString(),
                _id: s.customerInfo._id.toString(),
            } : null,
            staffs: (s.staffsInfo || []).map((st: any) => ({
                ...st,
                id: st._id.toString(),
                _id: st._id.toString(),
            }))
        }
        return jsonify(serialized)
    } catch (error) {
        console.error("Get shoot error:", error)
        return null
    }
}

export async function deleteShoot(id: string) {
    try {
        const db = await getDb()
        await db.collection("Shoot").deleteOne({ _id: new ObjectId(id) })

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
        const db = await getDb()
        const { id: _, ...updateData } = formData

        const result = await db.collection("Shoot").updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    ...updateData,
                    updatedAt: new Date(),
                    customerId: new ObjectId(updateData.customerId),
                    staffIds: (updateData.staffIds || []).map((id: string) => new ObjectId(id))
                }
            }
        )

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
        const db = await getDb()
        const shootOID = new ObjectId(shootId)

        // Mevcut çekimi getir
        const shoot = await db.collection("Shoot").findOne({ _id: shootOID })
        if (!shoot) return { success: false, error: "Çekim bulunamadı" }

        const currentDeposit = parseFloat(shoot.deposit || 0)
        const newDeposit = currentDeposit + amount

        // Shoot'un deposit alanını güncelle
        await db.collection("Shoot").updateOne(
            { _id: shootOID },
            { $set: { deposit: newDeposit, updatedAt: new Date() } }
        )

        // Finance işlemi olarak kaydet
        await db.collection("Transaction").insertOne({
            type: "INCOME",
            category: "Çekim Ödemesi",
            amount,
            description: note || `Çekim ödemesi (${shoot.title || shootId})`,
            date: new Date(),
            relatedId: shootOID,
            createdAt: new Date(),
        })

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
        const db = await getDb()
        await db.collection("Shoot").updateOne(
            { _id: new ObjectId(shootId) },
            { $set: { totalPrice: newPrice, updatedAt: new Date() } }
        )

        revalidatePath(`/shoots/${shootId}`)
        revalidatePath("/shoots")
        revalidatePath("/dashboard")

        return { success: true }
    } catch (error: any) {
        console.error("Update price error:", error)
        return { success: false, error: error.message }
    }
}

