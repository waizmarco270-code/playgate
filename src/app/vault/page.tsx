
'use client';
import { useVault } from "@/components/providers/vault-provider";
import { VaultGate } from "@/components/vault/vault-gate";
import { VaultContent } from "@/components/vault/vault-content";

export default function VaultPage() {
    const { isUnlocked } = useVault();

    return (
        <div className="h-full">
            {isUnlocked ? <VaultContent /> : <VaultGate />}
        </div>
    )
}
