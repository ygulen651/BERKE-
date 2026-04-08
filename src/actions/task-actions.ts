"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/firebase"
import { 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    query, 
    orderBy,
    serverTimestamp,
    Timestamp 
} from "firebase/firestore"

export async function createTask(formData: any) {
    try {
        const taskData = {
            ...formData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }

        const docRef = await addDoc(collection(db, "Task"), taskData)

        revalidatePath("/tasks")
        revalidatePath("/dashboard")
        return {
            success: true,
            task: { ...formData, id: docRef.id }
        }
    } catch (error: any) {
        console.error("Task creation error:", error)
        return { success: false, error: error.message }
    }
}

export async function getTasks() {
    try {
        const tasksRef = collection(db, "Task")
        const q = query(tasksRef, orderBy("createdAt", "desc"))
        const querySnapshot = await getDocs(q)
        
        const tasks = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        }))

        // Serialize timestamps for Next.js
        return JSON.parse(JSON.stringify(tasks))
    } catch (error) {
        console.error("Get tasks error:", error)
        return []
    }
}

export async function deleteTask(taskId: string) {
    try {
        await deleteDoc(doc(db, "Task", taskId))
        revalidatePath("/tasks")
        revalidatePath("/dashboard")
        return { success: true }
    } catch (error: any) {
        console.error("Task deletion error:", error)
        return { success: false, error: error.message }
    }
}


