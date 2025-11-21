import lifespan from "$lib/assets/life-game-rules/lifespan.js?raw";
import probabilistics from "$lib/assets/life-game-rules/probabilistics.js?raw";
import wolframcode from "$lib/assets/life-game-rules/wolframcode.js?raw";
import colorful from "$lib/assets/life-game-rules/colorful.js?raw";
import score from "$lib/assets/life-game-rules/score.js?raw";

export type RuleExplanation = {
  name: {
    ja: string;
    en: string;
  };
  description: {
    ja: string;
    en: string;
  };
  code: string;
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
      ja: "確率的オートマトン",
      en: "Probabilistic automaton",
    },
    description: {
      ja: "生死に確率を導入できます",
      en: "Introduce probability to life and death",
    },
    code: probabilistics,
  },
  wolframcode: {
    name: {
      ja: "ウルフラム・コード",
      en: "Wolfram code",
    },
    description: {
      ja: "物理学者スティーブン・ウルフラムが考案した１次元のセルオートマトンです",
      en: "a one-dimensional cellular automaton created by physicist Stephen Wolfram",
    },
    code: wolframcode,
  },
  colorful: {
    name: {
      ja: "カラフル",
      en: "Colorful",
    },
    description: {
      ja: "多彩な色付けを可能にするシステムです",
      en: "A system that enables colorful coloring",
    },
    code: colorful,
  },
  score: {
    name: {
      ja: "得点システム",
      en: "Score system",
    },
    description: {
      ja: "生きたセルの増加数で得点を競えます",
      en: "Compete for points based on the number of live cells gained",
    },
    code: score,
  },
};
