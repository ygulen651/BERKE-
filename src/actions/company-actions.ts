"use server"

import { getDb, jsonify, isValidObjectId } from "@/lib/mongodb"
import { revalidatePath } from "next/cache"
import { ObjectId } from "mongodb"



export async function createCompany(formData: any) {
    try {
        const db = await getDb()
        const company = {
            ...formData,
            createdAt: new Date(),
            updatedAt: new Date(),
        }

        const result = await db.collection("Company").insertOne(company)

        revalidatePath("/companies")
        revalidatePath("/shoots")
        revalidatePath("/dashboard")

        return jsonify({
            success: true,
            company: {
                ...company,
                id: result.insertedId.toString()
            }
        })
    } catch (error: any) {
        console.error("Company creation error:", error)
        return { success: false, error: error.message }
    }
}

export async function getCompanies(searchQuery?: string) {
    try {
        const db = await getDb()
        let query = {}
        if (searchQuery) {
            query = {
                $or: [
                    { name: { $regex: searchQuery, $options: "i" } },
                    { representative: { $regex: searchQuery, $options: "i" } },
                    { phone: { $regex: searchQuery, $options: "i" } },
                    { email: { $regex: searchQuery, $options: "i" } },
                ]
            }
        }
        const companies = await db.collection("Company").find(query).sort({ createdAt: -1 }).toArray()

        const serialized = companies.map(c => ({
            ...c,
            id: c._id.toString(),
            _id: c._id.toString()
        }))
        return jsonify(serialized)
    } catch (error) {
        console.error("Get companies error:", error)
        return []
    }
}

export async function getCompany(id: string) {
    try {
        if (!isValidObjectId(id)) return null
        const db = await getDb()
        const company = await db.collection("Company").findOne({ _id: new ObjectId(id) })

        if (!company) return null

        return jsonify({
            ...company,
            id: company._id.toString(),
            _id: company._id.toString()
        })
    } catch (error) {
        console.error("Get company error:", error)
        return null
    }
}

export async function deleteCompany(id: string) {
    try {
        if (!isValidObjectId(id)) return { success: false, error: "Geçersiz ID" }
        const db = await getDb()
        await db.collection("Company").deleteOne({ _id: new ObjectId(id) })


        revalidatePath("/companies")
        revalidatePath("/shoots")
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error: any) {
        console.error("Company deletion error:", error)
        return { success: false, error: error.message }
    }
}

export async function updateCompany(id: string, formData: any) {
    try {
        if (!isValidObjectId(id)) return { success: false, error: "Geçersiz ID" }
        const db = await getDb()
        const { id: _, ...updateData } = formData

        await db.collection("Company").updateOne(
            { _id: new ObjectId(id) },

            {
                $set: {
                    ...updateData,
                    updatedAt: new Date()
                }
            }
        )

        revalidatePath("/companies")
        return { success: true }
    } catch (error: any) {
        console.error("Company update error:", error)
        return { success: false, error: error.message }
    }
}
