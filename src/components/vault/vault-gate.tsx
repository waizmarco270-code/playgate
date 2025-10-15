
'use client';

import { useState } from "react";
import { useVault } from "../providers/vault-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Label } from "../ui/label";

export function VaultGate() {
    const { isPasswordSet, setPassword, unlock } = useVault();
    const [password, setPasswordInput] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isSettingUp, setIsSettingUp] = useState(!isPasswordSet);
    const [error, setError] = useState('');

    const handleSetPassword = async () => {
        if (password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setError('');
        await setPassword(password);
    }

    const handleUnlock = async () => {
        const success = await unlock(password);
        if (!success) {
            setError("Incorrect password.");
        } else {
            setError('');
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isSettingUp) {
            handleSetPassword();
        } else {
            handleUnlock();
        }
    }

    if (isSettingUp) {
        return (
            <div className="flex items-center justify-center h-full p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2">
                           <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle>Set Up Your Vault</CardTitle>
                        <CardDescription>Create a password to secure your private videos. This password cannot be recovered, so store it safely.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input 
                                    id="new-password"
                                    type="password" 
                                    value={password} 
                                    onChange={(e) => setPasswordInput(e.target.value)} 
                                    placeholder="Enter at least 6 characters" 
                                />
                            </div>
                            <div className="space-y-2">
                                 <Label htmlFor="confirm-password">Confirm Password</Label>
                                <Input 
                                    id="confirm-password"
                                    type="password" 
                                    value={confirmPassword} 
                                    onChange={(e) => setConfirmPassword(e.target.value)} 
                                    placeholder="Enter the same password again"
                                />
                            </div>
                            {error && <p className="text-sm text-destructive">{error}</p>}
                        </form>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleSetPassword}>Set Password & Enter Vault</Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }


    return (
        <div className="flex items-center justify-center h-full p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="text-center">
                     <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2">
                        <ShieldAlert className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Vault Locked</CardTitle>
                    <CardDescription>Enter your password to access the vault.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input 
                                id="password"
                                type="password" 
                                value={password} 
                                onChange={(e) => setPasswordInput(e.target.value)} 
                                placeholder="Enter your vault password"
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <Button className="w-full" onClick={handleUnlock}>Unlock</Button>
                    <Button variant="link" size="sm" onClick={() => setIsSettingUp(true)}>Forgot password? Reset Vault</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
