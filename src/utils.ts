import {
  PatternBagData,
  patternCategories,
  patterns,
} from "./patterns";

interface ByCategory {
  category: string;
  data: PatternBagData[];
}

const formatLabel = (s: string) => `${s[0].toUpperCase()}${s.slice(1)}s`;

export const patternsByCategory = patternCategories.map<ByCategory>((category) => {
  const byCat: ByCategory = {
    category: formatLabel(category),
    data: Object.values(patterns).filter((x) => x.category === category),
  };
  return byCat;
});