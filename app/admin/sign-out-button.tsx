"use client";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { authClient } from "@/lib/auth-client";
import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";

export function SignOutButton() {
    const handleSignOut = async () => {
        await authClient.signOut()

        return redirect('/');
    };

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button onClick={handleSignOut}><LogOut /></Button>
            </TooltipTrigger>
            <TooltipContent>
                <p>Sign Out</p>
            </TooltipContent>
        </Tooltip>
    )
}