// constant/rarityImages.ts
import BabyCapyImage from "@/assets/NFTs/BabyCapy.png";
import ExploreCapyImage from "@/assets/NFTs/ExploreCapy.png";
import WiseCapyImage from "@/assets/NFTs/WiseCapy.png";
import LegendaryCapyImage from "@/assets/NFTs/LegendaryCapy.png";
import GoldenCapyImage from "@/assets/NFTs/GoldenCapy.png";

export const rarityImages: { [key: number]: any } = {
  0: BabyCapyImage,
  1: ExploreCapyImage,
  2: WiseCapyImage,
  3: LegendaryCapyImage,
  4: GoldenCapyImage
};

export type Rarity = keyof typeof rarityImages;