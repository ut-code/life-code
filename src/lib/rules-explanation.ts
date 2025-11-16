import lifespan from "$lib/assets/life-game-rules/lifespan.js?raw";
import probabilistics from "$lib/assets/life-game-rules/probabilistics.js?raw";

export type RuleExplanation = {
  code: string;
  ja: string;
  en: string;
};

export const rulesExplanation = {
  lifespan: {
    code: lifespan,
    ja: "それぞれのいのちに寿命を設定できます",
    en: "Set lifespan for each cell",
  },
  probabilistics: {
    code: probabilistics,
    ja: "生死に確率を導入できます",
    en: "Introduce probability to life and death",
  },
};
