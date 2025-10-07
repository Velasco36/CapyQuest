// config/nftModels.ts
export const modelConfig = {
  0: {
    name: "Capy Bebe",
    modelPath: '/models/cofre_capy_baby.glb',
    tapaAnimation: 'tapaAction',
    capyAnimation: 'capy_babyAction',
    scale: 2,
    position: [0, -1.5, -17] as [number, number, number]
  },
  1: {
    name: 'Capy Explorador',
    modelPath: '/models/cofre_capy_explorer.glb',
    tapaAnimation: 'tapaAction',
    capyAnimation: 'capy_explorerAction',
    scale: 2,
    position: [0, -1.5, -17] as [number, number, number]
  },
  2: {
    name: 'Capy Sabio',
    modelPath: '/models/cofre_capy_wise.glb',
    tapaAnimation: 'tapaAction',
    capyAnimation: 'capy_wiseAction', 
    scale: 2,
    position: [0, -1.5, -17] as [number, number, number]
  },
  3: {
    name: 'Capy Legendario',
    modelPath: '/models/cofre_capy_legendary.glb',
    tapaAnimation: 'tapaAction',
    capyAnimation: 'capy_legendaryAction', // Special case
    scale: 2.2,
    position: [0, -1.8, -17] as [number, number, number]
  },
  4: {
    name: 'Capy Dorado',
    modelPath: '/models/cofre_capy_golden.glb',
    tapaAnimation: 'tapaAction', 
    capyAnimation: 'capy_goldenAction',
    scale: 2.3,
    position: [0, -1.8, -19] as [number, number, number]
  }
}

export type Rarity = keyof typeof modelConfig