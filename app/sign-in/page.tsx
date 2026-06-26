import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { email, z } from "zod";

export default function SignInPage() {
    const handleSubmit = async (formData: FormData) => {
        "use server";

        authClient.signIn.email({
            email: formData.get("email") as string,
            password: formData.get("password") as string,
        });
    }

    return (
        <div  className="h-screen w-full flex justify-center items-center">
            <div className="bg-slate-900/80 backdrop-blur-md shadow-2xl rounded-3xl p-6 border-2 border-slate-700/50 flex flex-col justify-between items-center gap-8 shrink-0">
                <p className="font-bold text-2xl text-white tracking-tight">Sign in</p>

                <form action={handleSubmit} className="flex flex-col gap-2 p-6 w-full">
                    <div className="flex flex-col gap-2">
                        <label htmlFor="email" className="text-sm font-medium text-white">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="bg-white border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="bg-white border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    <Button type="submit" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white cursor-pointer w-full">Sign in</Button>
                </form>
            </div>
        </div>
    )
}