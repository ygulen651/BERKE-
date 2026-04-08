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

export async function createCompany(formData: any) {
    try {
        const companyData = {
            ...formData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }

        const docRef = await addDoc(collection(db, "Company"), companyData)

        revalidatePath("/companies")
        revalidatePath("/shoots")
        revalidatePath("/dashboard")
        return {
            success: true,
            company: { ...formData, id: docRef.id }
        }
    } catch (error: any) {
        console.error("Company creation error:", error)
        return { success: false, error: error.message }
    }
}

export async function getCompanies(searchQuery?: string) {
    try {
        const companiesRef = collection(db, "Company")
        const q = query(companiesRef, orderBy("name"))
        const querySnapshot = await getDocs(q)
        
        let companies = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }))

        if (searchQuery) {
            const searchLower = searchQuery.toLowerCase()
            companies = companies.filter((c: any) => 
                (c.name?.toLowerCase() || "").includes(searchLower) ||
                (c.representative?.toLowerCase() || "").includes(searchLower) ||
                (c.phone || "").includes(searchLower) ||
                (c.email?.toLowerCase() || "").includes(searchLower)
            )
        }

        // Serialize timestamps for Next.js
        return JSON.parse(JSON.stringify(companies))
    } catch (error) {
        console.error("Get companies error:", error)
        return []
    }
}

export async function getCompany(id: string) {
    try {
        const docRef = doc(db, "Company", id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
            const data = docSnap.data()
            return JSON.parse(JSON.stringify({ ...data, id: docSnap.id }))
        } else {
            return null
        }
    } catch (error) {
        console.error("Get company error:", error)
        return null
    }
}

export async function deleteCompany(id: string) {
    try {
        await deleteDoc(doc(db, "Company", id))

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
        const companyRef = doc(db, "Company", id)
        await updateDoc(companyRef, {
            ...formData,
            updatedAt: serverTimestamp()
        })
        revalidatePath("/companies")
        return { success: true }
    } catch (error: any) {
        console.error("Company update error:", error)
        return { success: false, error: error.message }
    }
}


