"use client";

import { useState, useEffect, useCallback } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { contractAddress, CapyCoinAbi, publicClient, getWalletClient } from "@/utils/contract";
import { parseUnits, formatUnits } from "viem";

interface WalletState {
  address: string | null;
  balance: string | null;
  symbol: string;
  decimals: number;
}

export function useWallet() {
  const { user, ready, authenticated } = usePrivy();
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    balance: null,
    symbol: "CYC",
    decimals: 18,
  });
  const [loading, setLoading] = useState(false);

  // ----> cargar balance desde contrato
  const loadWallet = useCallback(async () => {
    if (!ready || !authenticated || !user?.wallet?.address) return;

    try {
      setLoading(true);
      const address = user.wallet.address as `0x${string}`;

      const balanceRaw = await publicClient.readContract({
        address: contractAddress as `0x${string}`,
        abi: CapyCoinAbi,
        functionName: "balanceOf",
        args: [address],
      });

      setWallet({
        address,
        balance: formatUnits(balanceRaw as bigint, 18),
        symbol: "CYC",
        decimals: 18,
      });
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error cargando wallet:", err.message);
      } else {
        console.error("Error cargando wallet:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [ready, authenticated, user]);

  // ----> cambiar a Moonbase Alpha
  const switchToMoonbaseAlpha = useCallback(async () => {
    if (!window.ethereum) return false;
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x507" }],
      });
      return true;
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x507",
                chainName: "Moonbase Alpha",
                nativeCurrency: { name: "DEV", symbol: "DEV", decimals: 18 },
                rpcUrls: ["https://rpc.api.moonbase.moonbeam.network"],
                blockExplorerUrls: ["https://moonbase.moonscan.io/"],
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error("Error añadiendo red:", addError);
          return false;
        }
      }
      console.error("Error cambiando red:", switchError);
      console.error("Error cambiando red:", switchError);
      return false;
    }
  }, []);

  // ----> comprar tokens
  const buyCapyCoins = useCallback(
    async (ethAmount: string) => {
      if (!ready || !authenticated || !user?.wallet?.address) {
        return { success: false, error: "No wallet conectada" };
      }
      try {
        setLoading(true);
        if (!window.ethereum) {
          return { success: false, error: "MetaMask no está disponible" };
        }

        // aseguramos red
        const currentChainId = await window.ethereum.request({ method: "eth_chainId" });
        if (currentChainId !== "0x507") {
          const switched = await switchToMoonbaseAlpha();
          if (!switched) return { success: false, error: "Debes usar Moonbase Alpha" };
          await new Promise((r) => setTimeout(r, 1000));
        }

        // verificamos cuentas
        const accounts = (await window.ethereum.request({ method: "eth_accounts" })) as string[];
        if (!accounts || accounts.length === 0) {
          return { success: false, error: "No se encontró cuenta en MetaMask" };
        }

        const privyAddr = user.wallet.address.toLowerCase();
        const metamaskAddr = accounts[0].toLowerCase();
        if (privyAddr !== metamaskAddr) {
          return {
            success: false,
            error: `Direcciones distintas. Usa ${privyAddr.slice(0, 8)}...`,
          };
        }

        const value = parseUnits(ethAmount, 18);
        const walletClient = getWalletClient(window.ethereum);

        const txHash = await walletClient.writeContract({
          address: contractAddress as `0x${string}`,
          abi: CapyCoinAbi,
          functionName: "buyCapyCoin",
          value,
          account: user.wallet.address as `0x${string}`,
        });

        await publicClient.waitForTransactionReceipt({ hash: txHash });
        await loadWallet();
        return { success: true, txHash };
      } catch (err: any) {
        console.error("Error compra:", err);
        return { success: false, error: err.message || "Error desconocido" };
      } finally {
        setLoading(false);
      }
    },
    [ready, authenticated, user, loadWallet, switchToMoonbaseAlpha]
  );

  // ----> agregar token a metamask
  const addTokenToMetaMask = useCallback(async () => {
    if (!window.ethereum) return false;
    try {
      await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: contractAddress,
            symbol: "CYC",
            decimals: 18,
            image: process.env.NEXT_PUBLIC_IPFS!,
          },
        },
      });
      return true;
    } catch (e) {
      console.error("Error watchAsset:", e);
      return false;
    }
  }, []);

  useEffect(() => {
    if (ready && authenticated && user?.wallet?.address) {
      loadWallet();
    }
  }, [ready, authenticated, user?.wallet?.address, loadWallet]);

  return {
    wallet,
    loading,
    buyCapyCoins,
    reload: loadWallet,
    isConnected: authenticated && !!user?.wallet?.address,
    switchToMoonbaseAlpha,
    addTokenToMetaMask,
    // switchToMoonbaseAlpha,
    // addTokenToMetaMask,
  };
}
