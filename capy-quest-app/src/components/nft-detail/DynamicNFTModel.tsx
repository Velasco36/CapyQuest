// components/DynamicNFTModel.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useGLTF, useAnimations, Html, useProgress } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { modelConfig, Rarity } from '@/configs/nftModels'

// Componente de carga para el modelo 3D
export function ModelLoader() {
  const { progress } = useProgress()
  return (
    <Html center>
      <div className="bg-black/80 text-white p-6 rounded-2xl backdrop-blur-sm border border-orange-500 text-center min-w-[200px]">
        <div className="w-8 h-8 animate-spin mx-auto mb-3 text-orange-400 border-2 border-orange-400 border-t-transparent rounded-full" />
        <p className="text-sm font-medium">Cargando modelo 3D...</p>
        <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs mt-2 text-orange-300">{Math.round(progress)}%</p>
      </div>
    </Html>
  )
}

interface DynamicNFTModelProps {
  rarity: Rarity
  position?: [number, number, number]
  scale?: number
}

export function DynamicNFTModel({ rarity, position, scale }: DynamicNFTModelProps) {
  const group = useRef<THREE.Group>(null)
  const config = modelConfig[rarity]
  
  // Cargar modelo dinámicamente basado en rareza
  const { scene, animations } = useGLTF(config.modelPath) as any
  const { actions } = useAnimations(animations, group)
  
  const [isDragging, setIsDragging] = useState(false)
  const [rotationY, setRotationY] = useState(Math.PI / 4)

  // Manejar interacciones de rotación
  const handlePointerDown = (e: any) => {
    e.stopPropagation()
    setIsDragging(true)
  }

  const handlePointerMove = (e: any) => {
    if (!isDragging) return
    const deltaX = e.movementX * 0.01
    setRotationY(prev => prev + deltaX)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  // Aplicar rotación en cada frame
  useFrame(() => {
    if (group.current) {
      group.current.rotation.y = rotationY
    }
  })

  // Event listeners globales para drag
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false)
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.movementX * 0.01
        setRotationY(prev => prev + deltaX)
      }
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
      document.body.style.cursor = 'grabbing'
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.body.style.cursor = 'default'
    }
  }, [isDragging])

  // Configurar animaciones
  useEffect(() => {
    if (!actions) return
    console.log("rarity:", rarity)
    console.log("actions:", actions)
    // Animación de la tapa
    const tapaAction = actions[config.tapaAnimation]
    if (tapaAction) {
      tapaAction.reset()
      tapaAction.setLoop(THREE.LoopOnce, 1)
      tapaAction.clampWhenFinished = true
      tapaAction.play()
    }

    // Animación del Capy (dinámica basada en rareza)
    const capyAction = actions[config.capyAnimation]
    if (capyAction) {
      capyAction.reset()
      capyAction.setLoop(THREE.LoopRepeat, Infinity)
      capyAction.clampWhenFinished = true
      capyAction.play()
    }
  }, [actions, config.tapaAnimation, config.capyAnimation])

  return (
    <group 
      ref={group} 
      position={position || config.position}
      scale={scale || config.scale}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <primitive 
        object={scene}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      />
    </group>
  )
}