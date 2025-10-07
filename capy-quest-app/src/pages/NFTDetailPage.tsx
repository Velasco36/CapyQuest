// app/nft/[id]/page.tsx
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Canvas } from '@react-three/fiber'
import { ArrowLeft, Zap, Loader, Info, MapPin, Box, X } from 'lucide-react'
import Image from 'next/image'

// Componentes modularizados
import { DynamicNFTModel, ModelLoader } from '@/components/nft-detail/DynamicNFTModel'
import { ARScene } from '@/components/nft-detail/ARExperience'
import { store } from '@/components/nft-detail/XRStore'

// Configuraciones
import { modelConfig, Rarity } from '@/configs/nftModels'
import { rarityImages } from '@/constant/rarityImages' // Asume que tienes esto
import { descNFTs } from '@/constant/descNFTs'
import { useNFTDistributed } from '@/hook/useNFTDistributed'
import { useUserLocationStore } from '@/stores/location/useUserLocationStore'

// Componente de carga para la página
function PageFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-amber-700 font-medium">Cargando NFT...</p>
      </div>
    </div>
  )
}

// Componente principal
function NFTDetailContent() {
  const { claimNFT, calculateDistance, nftState } = useNFTDistributed()
  const { userLocation, requestLocation } = useUserLocationStore()
  const searchParams = useSearchParams()
  const router = useRouter()

  const tokenId = searchParams.get("tokenId")
  const rarity = Number(searchParams.get("rarity") || 0) as Rarity

  const [isClaiming, setIsClaiming] = useState(false)
  const [currentNFT, setCurrentNFT] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInAR, setIsInAR] = useState(false)

  const config = modelConfig[rarity]
  const nftImage = rarityImages[rarity]
  const nftName = config?.name || "Capy"
  const nftDescription = descNFTs[rarity]?.description || "NFT especial de Capy."

  // Buscar NFT en la lista distribuida
  useEffect(() => {
    if (tokenId && nftState.distributedNFTs.length > 0) {
      const nft = nftState.distributedNFTs.find(
        (nft: any) => nft.tokenId.toString() === tokenId
      )
      setCurrentNFT(nft)
    }
    setIsLoading(false)
  }, [tokenId, nftState.distributedNFTs])

  // Reclamar NFT
  const handleClaim = async () => {
    if (!userLocation) {
      alert('Necesitas activar tu ubicación para reclamar NFTs')
      await requestLocation()
      return
    }

    if (!currentNFT) {
      alert('No se pudo encontrar la información del NFT')
      return
    }

    setIsClaiming(true)
    try {
      const [lat, lng] = currentNFT.location.split(',').map(parseFloat)
      const nftLocation = { lat, lng }
      
      const distance = calculateDistance(userLocation, nftLocation)
      
      if (distance > 15000) {
        alert(`Estás a ${distance.toFixed(2)} metros del NFT. Debes estar dentro de 15 metros para reclamarlo.`)
        setIsClaiming(false)
        return
      }

      const result = await claimNFT(currentNFT.tokenId, currentNFT.location)
      
      if (result.success) {
        alert('NFT reclamado exitosamente!')
        router.back()
      } else {
        alert(`Error al reclamar el NFT: ${result.error}`)
      }
    } catch (error) {
      console.error('Error claiming NFT:', error)
      alert('Error al reclamar el NFT')
    } finally {
      setIsClaiming(false)
    }
  }

  // Manejar AR
  const handleEnterAR = () => {
    setIsInAR(true)
    store.enterAR().catch(console.error)
  }

  const handleExitAR = () => {
    setIsInAR(false)
    store.endSession()
  }

  // Estados de carga
  if (isLoading) return <PageFallback />

  if (!currentNFT && nftState.distributedNFTs.length > 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden p-6 text-center">
          <h2 className="text-xl font-bold text-amber-800 mb-4">NFT No Encontrado</h2>
          <p className="text-amber-600 mb-4">El NFT que buscas no está disponible.</p>
          <button
            onClick={() => router.back()}
            className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-3 rounded-xl font-semibold"
          >
            Volver al Mapa
          </button>
        </div>
      </div>
    )
  }

  // Vista de Realidad Aumentada
  if (isInAR) {
    return (
      <ARScene 
        nftName={nftName}
        tokenId={tokenId}
        nftImage={nftImage}
        rarity={rarity}
        onExit={handleExitAR}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 safe-area-inset-bottom">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-yellow-400 to-orange-400 p-4 flex items-center justify-between shadow-lg safe-area-inset-top">
        <button
          onClick={() => router.back()}
          className="text-white p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors backdrop-blur-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-white">Detalle del NFT</h1>
        <div className="w-9"></div>
      </header>

      {/* Overlay para AR */}
      <div id="overlay" className="hidden" />

      {/* Contenido principal */}
      <main className="pt-16 pb-32">
        {/* Información del NFT */}
        <section className="p-4 space-y-4">
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-orange-100">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-20 h-20 rounded-2xl border-3 border-yellow-400 overflow-hidden shadow-lg">
                <Image 
                  src={nftImage} 
                  alt={nftName}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  priority
                />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold text-amber-800 mb-1">{nftName}</h2>
                <div className="flex items-center gap-2 mb-2">
                  <div className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-xs font-medium">
                    Token ID: #{tokenId}
                  </div>
                  <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-medium">
                    {config.name}
                  </div>
                </div>
                <div className="flex items-center gap-1 text-amber-600">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">NFT de ubicación</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-5 h-5 text-amber-600" />
              <h3 className="font-semibold text-amber-800 text-lg">Descripción</h3>
            </div>
            <p className="text-amber-700 text-sm leading-relaxed bg-amber-50 p-3 rounded-xl border border-amber-100">
              {nftDescription}
            </p>
          </div>
        </section>

        {/* Modelo 3D */}
        <section className="h-[70vh] min-h-[500px] bg-gradient-to-b from-white/80 to-orange-50/80 backdrop-blur-sm border-t border-b border-orange-200 relative">
          <Canvas
            camera={{ position: [0, 0, 8], fov: 45 }}
            style={{ width: '100%', height: '100%', cursor: 'grab' }}
            gl={{
              powerPreference: "high-performance",
              antialias: true,
              alpha: true
            }}
            dpr={[1, 2]}
          >
            <Suspense fallback={<ModelLoader />}>
              <ambientLight intensity={1.2} />
              <directionalLight position={[3, 10, 5]} intensity={1.5} castShadow />
              <pointLight position={[-5, 5, 5]} intensity={0.5} color="#ffaa33" />
              
              <DynamicNFTModel rarity={rarity} />
            </Suspense>
          </Canvas>
          
          <div className="absolute top-3 left-3 bg-black/60 text-white px-3 py-1 rounded-full backdrop-blur-sm">
            <div className="flex items-center gap-1 text-xs">
              <Box className="w-3 h-3" />
              <span>Vista Previa 3D - {config.name}</span>
            </div>
          </div>

          <button 
            onClick={handleEnterAR}
            className="absolute top-3 right-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-full font-semibold flex items-center gap-2 hover:from-purple-600 hover:to-blue-600 transition-all shadow-lg text-sm backdrop-blur-sm"
          >
            <Box className="w-4 h-4" />
            Ver en AR
          </button>

          <div className="absolute bottom-3 left-3 bg-black/60 text-white px-3 py-2 rounded-xl backdrop-blur-sm max-w-[200px]">
            <p className="text-xs text-orange-300">💡 Arrastra para rotar el modelo</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-t border-orange-200 shadow-2xl safe-area-inset-bottom">
        <div className="max-w-md mx-auto space-y-3">
          <button
            onClick={handleClaim}
            disabled={!userLocation || isClaiming || !currentNFT}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:from-green-600 hover:to-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {isClaiming ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Reclamando NFT...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>
                  {userLocation && currentNFT 
                    ? 'Reclamar NFT Ahora' 
                    : !userLocation 
                    ? 'Activa Ubicación' 
                    : 'NFT No Disponible'
                  }
                </span>
              </>
            )}
          </button>

          {!userLocation && (
            <button
              onClick={requestLocation}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-semibold text-sm shadow-lg hover:from-blue-600 hover:to-blue-700 transition-all"
            >
              📍 Activar Ubicación para Reclamar
            </button>
          )}
        </div>
      </footer>
    </div>
  )
}

// Componente principal con Suspense boundary
export default function NFTDetailPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <NFTDetailContent />
    </Suspense>
  )
}