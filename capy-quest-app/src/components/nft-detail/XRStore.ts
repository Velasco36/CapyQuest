// components/XRStore.ts
'use client'

import { createXRStore } from '@react-three/xr'

// Configurar el overlay root para AR
const overlayRoot = typeof document !== 'undefined' ? document.getElementById('overlay') : null

export const store = createXRStore({
  domOverlay: overlayRoot ? { root: overlayRoot as HTMLElement } : undefined
})