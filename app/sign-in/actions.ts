"use server";

import { auth } from "@/lib/auth";

export async function handleSubmit (formData: FormData) {
    await auth.api.signInEmail({
        body: {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
        }
    });
}