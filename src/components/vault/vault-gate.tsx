

'use client';

import { useState } from "react";
import { useVault } from "../providers/vault-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ShieldCheck, Mail, KeyRound, Copy, ArrowLeft } from "lucide-react";
import { Label } from "../ui/label";
import { AnimatePresence, motion } from "framer-motion";
import { generateSupportCode, verifyUnlockKey } from "@/lib/crypto";
import { useToast } from "@/hooks/use-toast";

type GateState = 'login' | 'setup' | 'forgot_password_start' | 'forgot_password_enter_key';

export function VaultGate() {
    const { isPasswordSet, setPassword, unlock } = useVault();
    const [password, setPasswordInput] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [gateState, setGateState] = useState<GateState>(isPasswordSet ? 'login' : 'setup');
    const [error, setError] = useState('');
    const [supportCode, setSupportCode] = useState('');
    const [unlockKey, setUnlockKey] = useState('');
    const { toast } = useToast();

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
        // Successful setup will automatically log the user in via the provider
    }

    const handleUnlock = async () => {
        const success = await unlock(password);
        if (!success) {
            setError("Incorrect password. Please try again.");
        } else {
            setError('');
        }
    }
    
    const handlePasswordReset = async () => {
        if (!unlockKey) {
            setError("Please enter the unlock key.");
            return;
        }
        const isValid = await verifyUnlockKey(supportCode, unlockKey);
        if (isValid) {
            setGateState('setup');
            setError('');
            setPasswordInput('');
            setConfirmPassword('');
        } else {
            setError("Invalid unlock key. Please check the key and try again.");
        }
    }

    const handleStartPasswordReset = async () => {
        const code = await generateSupportCode();
        setSupportCode(code);
        setGateState('forgot_password_start');
    }

    const handleContactDeveloper = () => {
        const subject = "PlayGate Vault Password Reset Request";
        const body = `I have forgotten my PlayGate vault password and would like to request a reset.\n\nMy Support Code is: ${supportCode}\n\nPlease provide me with the Unlock Key.`;
        window.location.href = `mailto:waizmonazzum270@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    
    const copySupportCode = () => {
        navigator.clipboard.writeText(supportCode);
        toast({ title: "Copied!", description: "Support code copied to clipboard." });
    }

    const renderLogin = () => (
        <Card className="w-full max-w-sm">
            <CardHeader className="text-center">
                 <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2">
                    <ShieldAlert className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Vault Locked</CardTitle>
                <CardDescription>Enter your password to access the vault.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleUnlock(); }} className="space-y-4">
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
                <Button variant="link" size="sm" className="text-muted-foreground" onClick={handleStartPasswordReset}>
                   Having Trouble? Reset Password
                </Button>
            </CardFooter>
        </Card>
    );
    
    const renderSetup = () => (
         <Card className="w-full max-w-md">
            <CardHeader className="text-center">
                <div className="mx-auto bg-primary/10 p-3 rounded-full mb-2">
                   <ShieldCheck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>{isPasswordSet ? 'Reset Vault Password' : 'Set Up Your Secure Vault'}</CardTitle>
                <CardDescription>
                    {isPasswordSet 
                        ? 'Your vault is being reset. Please create a new password.' 
                        : 'Create a password for your private video vault. This will encrypt your data.'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={(e) => { e.preventDefault(); handleSetPassword(); }} className="space-y-4">
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
                <Button className="w-full" onClick={handleSetPassword}>{isPasswordSet ? 'Set New Password' : 'Set Password & Secure Vault'}</Button>
            </CardFooter>
        </Card>
    );

    const renderForgotPasswordStart = () => (
        <Card className="w-full max-w-md">
            <CardHeader>
                 <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={() => setGateState('login')}><ArrowLeft /></Button>
                <CardTitle className="text-center pt-8">Password Reset</CardTitle>
                <CardDescription className="text-center">Follow these steps to request a password reset from the developer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div>
                    <Label className="text-xs text-muted-foreground">Step 1: Your Unique Support Code</Label>
                    <div className="flex items-center gap-2 mt-1">
                        <Input readOnly value={supportCode} className="font-mono text-center tracking-widest" />
                        <Button variant="outline" size="icon" onClick={copySupportCode}><Copy /></Button>
                    </div>
                </div>
                 <div>
                    <Label className="text-xs text-muted-foreground">Step 2: Contact Developer</Label>
                    <p className="text-xs text-muted-foreground mt-1">Click the button below to open an email with your support code. Send the email to the developer.</p>
                </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
                <Button className="w-full" onClick={handleContactDeveloper}><Mail className="mr-2"/> Email Developer</Button>
                <Button variant="outline" className="w-full" onClick={() => setGateState('forgot_password_enter_key')}>I have an Unlock Key</Button>
            </CardFooter>
        </Card>
    );

    const renderForgotPasswordEnterKey = () => (
         <Card className="w-full max-w-md">
            <CardHeader>
                <Button variant="ghost" size="icon" className="absolute top-4 left-4" onClick={() => setGateState('forgot_password_start')}><ArrowLeft /></Button>
                <CardTitle className="text-center pt-8">Enter Unlock Key</CardTitle>
                <CardDescription className="text-center">Enter the Unlock Key you received from the developer.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="unlock-key">Unlock Key</Label>
                    <Input 
                        id="unlock-key"
                        value={unlockKey} 
                        onChange={(e) => {setUnlockKey(e.target.value); setError('')}}
                        placeholder="e.g., A1B2-C3D4-E5F6"
                        className="font-mono text-center tracking-widest"
                    />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
            <CardFooter className="flex-col">
                <Button className="w-full" onClick={handlePasswordReset}><KeyRound className="mr-2" />Verify & Reset</Button>
            </CardFooter>
        </Card>
    );

    const renderContent = () => {
        switch (gateState) {
            case 'setup': return renderSetup();
            case 'login': return renderLogin();
            case 'forgot_password_start': return renderForgotPasswordStart();
            case 'forgot_password_enter_key': return renderForgotPasswordEnterKey();
            default: return renderLogin();
        }
    }


    return (
        <div className="flex items-center justify-center h-full p-4">
            <AnimatePresence mode="wait">
                <motion.div
                    key={gateState}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className="w-full max-w-md"
                >
                  {renderContent()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
