import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { auth, db } from "@/lib/firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Şifre", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    console.log("Authorization fail: Missing credentials");
                    return null;
                }
                
                try {
                    console.log("Attempting Firebase Login for:", credentials.email);
                    
                    // Sign in with Firebase Auth
                    const userCredential = await signInWithEmailAndPassword(
                        auth, 
                        credentials.email, 
                        credentials.password
                    )
                    const user = userCredential.user
                    console.log("Firebase Auth success for UID:", user.uid);

                    // Get additional user data (role) from Firestore
                    // Note: Collection name is singular "User" based on your screenshot
                    const userDoc = await getDoc(doc(db, "User", user.uid))
                    const userData = userDoc.exists() ? userDoc.data() : null
                    
                    if (!userData) {
                        console.warn("User found in Auth but no profile found in Firestore for UID:", user.uid);
                    }

                    return {
                        id: user.uid,
                        email: user.email,
                        name: user.displayName || userData?.name || "Kullanıcı",
                        role: (userData?.role || "EMPLOYEE").toUpperCase(),
                    }
                } catch (error: any) {
                    console.error("Login Error Details:", error.code, error.message);
                    // NextAuth interprets specific errors differently. 
                    // Throwing Error here usually leads to a 401 on the callback route.
                    return null; 
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = (user as any).role ? (user as any).role.toString().toUpperCase() : "EMPLOYEE"
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                const userRole = (token.role as string) || "EMPLOYEE"
                ;(session.user as any).role = userRole.toString().toUpperCase()
                ;(session.user as any).id = token.id as string
            }
            return session
        }
,
    },


    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
}


const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }

