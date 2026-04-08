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

export async function createEmployee(formData: any) {
    try {
        const employeeData = {
            ...formData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }

        const docRef = await addDoc(collection(db, "User"), employeeData)

        revalidatePath("/employees")
        return {
            success: true,
            user: { ...formData, id: docRef.id },
            temporaryPassword: formData.password || "berke123"
        }
    } catch (error: any) {
        console.error("Employee creation error:", error)
        return { success: false, error: error.message }
    }
}

export async function deleteEmployee(userId: string) {
    try {
        await deleteDoc(doc(db, "User", userId))
        revalidatePath("/employees")
        return { success: true }
    } catch (error: any) {
        console.error("Employee deletion error:", error)
        return { success: false, error: error.message }
    }
}

export async function getEmployees() {
    try {
        const employeesRef = collection(db, "User")
        const q = query(employeesRef, orderBy("name"))
        const querySnapshot = await getDocs(q)
        
        const employees = querySnapshot.docs.map(doc => {
            const data = doc.data()
            return {
                ...data,
                id: doc.id,
                // Ensure dates are serialized to ISO strings
                createdAt: data.createdAt instanceof Timestamp 
                    ? data.createdAt.toDate().toISOString() 
                    : data.createdAt,
                updatedAt: data.updatedAt instanceof Timestamp 
                    ? data.updatedAt.toDate().toISOString() 
                    : data.updatedAt,
            }
        })

        return JSON.parse(JSON.stringify(employees))
    } catch (error) {
        console.error("Get employees error:", error)
        return []
    }
}


export async function changeEmployeeRole(userId: string, newRole: "ADMIN" | "EMPLOYEE") {
    try {
        const employeeRef = doc(db, "User", userId)
        await updateDoc(employeeRef, {
            role: newRole,
            updatedAt: serverTimestamp()
        })
        revalidatePath("/employees")
        return { success: true }
    } catch (error: any) {
        console.error("Change role error:", error)
        return { success: false, error: error.message }
    }
}



