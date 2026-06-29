"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export function SignOutButton() {
    const handleSignOut = async () => {
        await authClient.signOut()

        return redirect('/');
    };

    return <Button onClick={handleSignOut}>Sign Out</Button>
}