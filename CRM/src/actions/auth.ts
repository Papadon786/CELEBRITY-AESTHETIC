"use server"

import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server"
import { loginSchema, type LoginInput } from "@/lib/validations/auth"

export async function login(input: LoginInput) {
  try {
    const data = loginSchema.parse(input)
    const email = data.email.toLowerCase().trim()

    const supabase = await createSupabaseServerClient()
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password: data.password,
    })

    if (error || !authData.user) {
      return { success: false, error: "Invalid email or password" }
    }

    const user = await prisma.user.findUnique({ where: { supabaseUserId: authData.user.id } })

    if (!user || !user.active) {
      await supabase.auth.signOut()
      return { success: false, error: "This account is not set up for CRM access. Contact your administrator." }
    }

    return { success: true, user: { id: user.id, name: user.name, role: user.role } }
  } catch (err: any) {
    console.error("[login] Error:", err)
    return { success: false, error: err?.message || "Invalid email or password" }
  }
}

export async function logout() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  redirect("/login")
}
