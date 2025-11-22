import { useCallback, useEffect, useMemo, useState } from "react"
import type { MiniAppSDK, MiniAppContext } from "@farcaster/miniapp-sdk"
import { toast } from "sonner"

export type MiniAppUser = MiniAppContext["user"] & {
  address?: string
}

type HookState = {
  user: MiniAppUser | null
  isInMiniApp: boolean | null
  isInitializing: boolean
  isConnecting: boolean
  sdk: MiniAppSDK | null
  deepLinkUrl: string
}

export function useMiniAppAuth(): {
  user: MiniAppUser | null
  isInMiniApp: boolean | null
  isInitializing: boolean
  isConnecting: boolean
  deepLinkUrl: string
  connectWallet: () => Promise<void>
} {
  const [{ user, isInMiniApp, isInitializing, isConnecting, sdk, deepLinkUrl }, setState] = useState<HookState>(
    {
      user: null,
      isInMiniApp: null,
      isInitializing: true,
      isConnecting: false,
      sdk: null,
      deepLinkUrl: "",
    },
  )

  const setPartialState = useCallback(
    (updates: Partial<HookState>) =>
      setState((prev) => ({
        ...prev,
        ...updates,
      })),
    [],
  )

  useEffect(() => {
    let mounted = true

    const init = async () => {
      try {
        const { default: loadedSdk } = await import("@farcaster/miniapp-sdk")
        const embedded = await loadedSdk.isInMiniApp()
        const context = embedded ? await loadedSdk.context : null

        if (!mounted) return

        setPartialState({
          sdk: loadedSdk,
          isInMiniApp: embedded,
          user: context?.user ?? null,
          deepLinkUrl: window.location.href,
        })

        if (embedded) {
          await loadedSdk.actions.ready?.()
        }
      } catch (error) {
        console.error("Failed to initialize MiniApp SDK", error)
        if (!mounted) return
        setPartialState({
          isInMiniApp: false,
          deepLinkUrl: window.location.href,
        })
      } finally {
        if (mounted) {
          setPartialState({ isInitializing: false })
        }
      }
    }

    init()

    return () => {
      mounted = false
    }
  }, [setPartialState])

  const connectWallet = useCallback(async () => {
    if (!sdk) {
      toast.error("MiniApp SDK not ready yet")
      return
    }

    if (!isInMiniApp) {
      toast.error("Open this miniapp inside Base App to connect")
      setPartialState({ isInMiniApp: false, deepLinkUrl: window.location.href })
      return
    }

    setPartialState({ isConnecting: true })
    try {
      const provider = await sdk.wallet.getEthereumProvider()

      if (!provider || typeof provider.request !== "function") {
        throw new Error("Ethereum provider not available in Base App")
      }

      const accounts = await provider.request({ method: "eth_requestAccounts" })
      const address = Array.isArray(accounts) && accounts.length > 0 ? accounts[0] : undefined
      const context = await sdk.context

      setPartialState({
        user: {
          ...context.user,
          address,
        },
      })
    } catch (error: any) {
      const message = error?.message || "Connection rejected"
      toast.error(message)
    } finally {
      setPartialState({ isConnecting: false })
    }
  }, [sdk, isInMiniApp, setPartialState])

  return useMemo(
    () => ({
      user,
      isInMiniApp,
      isInitializing,
      isConnecting,
      deepLinkUrl,
      connectWallet,
    }),
    [connectWallet, deepLinkUrl, isConnecting, isInMiniApp, isInitializing, user],
  )
}
