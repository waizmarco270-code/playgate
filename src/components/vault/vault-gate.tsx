
'use client';

import { useState } from "react";
import { useVault } from "../providers/vault-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck, Mail } from "lucide-react";
import { Label } from "../ui/label";
import { AnimatePresence, motion } from "framer-motion";

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
            setError("Incorrect password. Please try again.");
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
    
    const handleContactDeveloper = () => {
        const subject = "PlayGate Vault Password Reset Request";
        const body = "I have forgotten my PlayGate vault password and would like to request assistance with resetting it. Please let me know the next steps.";
        window.location.href = `mailto:waizmonazzum270@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }

    if (isSettingUp) {
        return (
            <div className="flex items-center justify-center h-full p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2">
                           <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                        <CardTitle>Set Up Your Secure Vault</CardTitle>
                        <CardDescription>Create a password for your private video vault. This will encrypt your data.</CardDescription>
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
                            
                            <AnimatePresence>
                                {password.length > 0 && confirmPassword.length > 0 && (
                                     <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="!mt-6 p-4 rounded-lg border border-amber-500/50 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                    >
                                        <h4 className="font-bold mb-2 text-sm">⚠️ Important Security Notice</h4>
                                        <p className="text-xs leading-relaxed">This password is the ONLY key to your vault. It is **not** stored on any server and **cannot be recovered** if you forget it. Please store it in a safe, private place like a password manager.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                        </form>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleSetPassword}>Set Password & Secure Vault</Button>
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
                                onChange={(e) => { setPasswordInput(e.target.value); setError(''); }}
                                placeholder="Enter your vault password"
                            />
                        </div>
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </form>
                </CardContent>
                <CardFooter className="flex-col gap-4">
                    <Button className="w-full" onClick={handleUnlock}>Unlock</Button>
                    <Button variant="link" size="sm" className="text-muted-foreground" onClick={handleContactDeveloper}>
                       <Mail className="mr-2 h-4 w-4"/> Having Trouble? Contact Developer
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
