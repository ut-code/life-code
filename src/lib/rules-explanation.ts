import lifespan from "$lib/assets/life-game-rules/lifespan.js?raw";
import probabilistics from "$lib/assets/life-game-rules/probabilistics.js?raw";

export type RuleExplanation = {
  code: string;
  ja: string;
  en: string;
};

export const rulesExplanation = {
  lifespan: {
    name: {
      ja: "寿命システム",
      en: "Lifespan system",
    },
    description: {
      ja: "それぞれのいのちに寿命を設定できます",
      en: "Set lifespan for each cell",
    },
    code: lifespan,
  },
  probabilistics: {
    name: {
      ja: "確率システム",
      en: "Probabilistic system",
    },
    description: {
      ja: "生死に確率を導入できます",
      en: "Introduce probability to life and death",
    },
    code: probabilistics,
  },
};
