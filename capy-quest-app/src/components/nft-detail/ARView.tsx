'use client'

import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF, useAnimations } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { XR, XRDomOverlay, createXRStore } from '@react-three/xr'

// Store para XR
const store = createXRStore()

interface ARViewProps {
  modelPath: string
  nftName: string
  rarity: number
}

function NFTModel({ modelPath, ...props }: any) {
  const group = useRef<THREE.Object3D>(null)
  const { scene, animations } = useGLTF(modelPath)
  const { actions } = useAnimations(animations, group)

  useEffect(() => {
    if (!actions) return

    // Animación de la tapa del cofre
    const tapaAction = actions['tapaAction']
    if (tapaAction) {
      tapaAction.reset()
      tapaAction.setLoop(THREE.LoopOnce, 1)
      tapaAction.clampWhenFinished = true
      tapaAction.play()
    }

    // Animación del Capy (usando el nombre genérico que comparten todos los modelos)
    const capyAction = actions['capy_babyAction'] || 
                      actions['capy_exploreAction'] || 
                      actions['capy_wiseAction'] || 
                      actions['capy_legendaryAction'] || 
                      actions['capy_goldenAction']
    
    if (capyAction) {
      capyAction.reset()
      capyAction.setLoop(THREE.LoopRepeat, Infinity)
      capyAction.clampWhenFinished = true
      capyAction.play()
    }
  }, [actions])

  return <primitive ref={group} object={scene} {...props} />
}

const ARView: React.FC<ARViewProps> = ({ modelPath, nftName, rarity }) => {
  const rarityColors = {
    0: 'from-blue-400 to-blue-600',    // Baby - Azul
    1: 'from-green-400 to-green-600',  // Explore - Verde
    2: 'from-purple-400 to-purple-600', // Wise - Púrpura
    3: 'from-red-400 to-red-600',      // Legendary - Rojo
    4: 'from-yellow-400 to-yellow-600' // Golden - Dorado
  }

  const gradientClass = rarityColors[rarity as keyof typeof rarityColors] || 'from-gray-400 to-gray-600'

  return (
    <>
      {/* Overlay DOM */}
      <div id="overlay" style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        zIndex: 20,
        width: '100%',
        pointerEvents: 'none'
      }}>
        <div className={`bg-gradient-to-r ${gradientClass} p-4 text-white text-center`}>
          <h1 className="text-xl font-bold">{nftName}</h1>
          <p className="text-sm opacity-90">Realidad Aumentada</p>
        </div>
      </div>

      <Canvas style={{ width: '100%', height: '100%' }}>
        <XR store={store}>
          <ambientLight intensity={1.5} />
          <directionalLight position={[2, 5, 2]} intensity={2} />
          <pointLight position={[-2, -2, -2]} intensity={1} />

          <XRDomOverlay style={{ width: '100%', height: '100%' }}>
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: '1rem 2rem',
                borderRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                pointerEvents: 'auto'
              }}
            >
              <h1 style={{ 
                color: 'white', 
                margin: 0,
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}>
                {nftName}
              </h1>
              <button
                style={{
                  background: 'linear-gradient(135deg, #ff416c, #ff4b2b)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.6rem 1.2rem',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)'
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.3)'
                }}
                onClick={() => store.enterAR()}
              >
                🚀 Activar AR
              </button>
            </div>
          </XRDomOverlay>

          <NFTModel 
            position={[0, -1, -15]} 
            scale={2} 
            rotation={[0, 0, 0]}
            modelPath={modelPath}
          />
        </XR>
      </Canvas>
    </>
  )
}

export default ARView