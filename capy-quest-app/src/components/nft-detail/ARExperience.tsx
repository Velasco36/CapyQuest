// components/ARExperience.tsx
'use client'

import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { XR, XRDomOverlay } from '@react-three/xr'
import { DynamicNFTModel, ModelLoader } from './DynamicNFTModel'
import { modelConfig, Rarity } from '@/configs/nftModels'
import Image from 'next/image'
import { X } from 'lucide-react'

// Store XR global (debe ser la misma instancia)
import { store } from './XRStore'

interface ARSceneProps {
  nftName: string
  tokenId: string | null
  nftImage: any
  rarity: Rarity
  onExit: () => void
}

export function ARScene({ nftName, tokenId, nftImage, rarity, onExit }: ARSceneProps) {
  const config = modelConfig[rarity]

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <Canvas 
        style={{ width: '100%', height: '100%' }}
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{
          powerPreference: "high-performance",
          antialias: true,
          alpha: true
        }}
      >
        <XR store={store}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[2, 5, 2]} intensity={2} />
          
          <XRDomOverlay>
            <div className="ar-header bg-black/90 backdrop-blur-md text-white p-4 rounded-b-2xl shadow-2xl border-b border-orange-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-orange-400 overflow-hidden">
                    <Image 
                      src={nftImage} 
                      alt={nftName}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="font-bold text-lg text-orange-300">{nftName}</h1>
                    <p className="text-orange-200 text-sm">Token ID: #{tokenId}</p>
                    <p className="text-orange-200 text-xs">{config.name}</p>
                  </div>
                </div>
                <button
                  onClick={onExit}
                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </XRDomOverlay>

          <Suspense fallback={<ModelLoader />}>
            <DynamicNFTModel 
              rarity={rarity}
              position={[0, -2, -5]}
              scale={1.5}
            />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  )
}