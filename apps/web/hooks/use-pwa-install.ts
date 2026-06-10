"use client"

import { useState, useEffect } from "react"

export function useIsIOSSafari(): boolean {
  const [isIOSSafari, setIsIOSSafari] = useState(false)

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true

    if (isStandalone) return

    const ua = navigator.userAgent
    const isIOS = /iphone|ipad|ipod/i.test(ua)
    const isSafari = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua)

    setIsIOSSafari(isIOS && isSafari)
  }, [])

  return isIOSSafari
}
