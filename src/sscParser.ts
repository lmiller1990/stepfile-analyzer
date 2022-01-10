const chartDifficulty = [
  "Beginner",
  "Easy",
  "Medium",
  "Hard",
  "Challenge",
] as const;

type ChartDifficulty = typeof chartDifficulty[number];

type TokenType =
  | "stepsType"
  | "title"
  | "endOfNotes"
  | "meter"
  | "notes"
  | "difficulty"
  | "noteLine"
  | "EOF";

export interface TokenMatch {
  type: TokenType;
  regexp: RegExp;
}

const difficultyRegexp = /#DIFFICULTY:(.*);/;
const meterRegexp = /#METER:(.*);/;
const titleRegexp = /#TITLE:(.*);/;
const stepsTypeRegexp = /#STEPSTYPE:(.*);/;

const tokenMatches: TokenMatch[] = [
  {
    type: "difficulty",
    regexp: difficultyRegexp,
  },
  {
    type: "notes",
    regexp: /#NOTES:/,
  },
  {
    type: "title",
    regexp: titleRegexp,
  },
  {
    type: "stepsType",
    regexp: stepsTypeRegexp,
  },
  {
    type: "meter",
    regexp: meterRegexp,
  },
  {
    type: "noteLine",
    regexp: /^[0|1|2|3|X]{4}$/,
  },
  {
    type: "endOfNotes",
    regexp: /^;$/,
  },
];

class NoMatchingTokenError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = "NoMatchingTokenError";
  }
}

export function matchToken(word: string): TokenMatch {
  for (const token of tokenMatches) {
    const matches = word.match(token.regexp);
    if (matches) {
      return token;
    }
  }

  throw new NoMatchingTokenError(`No match found for "${word}"`);
}

export interface CharacterToken {
  type: TokenType;
  value: string;
}

export function tokenizeSSC(data: string): CharacterToken[] {
  const lines = data.split("\n").reduce<string[]>((acc, curr) => {
    const t = curr.trim();
    return t.length === 0 ? acc : [...acc, t];
  }, []);

  const charTokens: CharacterToken[] = [];

  for (const line of lines) {
    try {
      const tokenType = matchToken(line);

      const token: CharacterToken = {
        type: tokenType.type,
        value: line,
      };

      charTokens.push(token);
    } catch (e) {
      if (!(e instanceof NoMatchingTokenError)) {
        throw e;
      }
    }
  }

  charTokens.push({ type: "EOF", value: "" });

  return charTokens;
}

interface ParsedTitle {
  type: "title";
  value: string;
}

interface ParsedDifficulty {
  type: "difficulty";
  value: ChartDifficulty;
}

interface ParsedMeter {
  type: "meter";
  value: string;
}

interface ParsedNotes {
  type: "notes";
  value: string;
}

interface ParsedStepsType {
  type: "stepsType";
  value: "dance-single" | string;
}

interface ParsedEOF {
  type: "EOF";
}

type ParsedNode =
  | ParsedDifficulty
  | ParsedMeter
  | ParsedNotes
  | ParsedTitle
  | ParsedStepsType
  | ParsedEOF;

export class SSCParser {
  private nodes: ParsedNode[] = [];

  constructor(private tokens: CharacterToken[]) {}

  private peek(token: TokenType) {
    return token === this.tokens[0].type;
  }

  private consume() {
    return this.tokens.shift()!;
  }

  private parseDifficulty(): ParsedDifficulty {
    const token = this.consume();
    const match = token.value.match(difficultyRegexp);
    const difficulty = match?.[1] as ChartDifficulty;
    if (!difficulty || !chartDifficulty.includes(difficulty)) {
      throw Error(
        `Expected difficult to be in ${chartDifficulty.join(
          " "
        )} but got ${difficulty}`
      );
    }
    return {
      value: difficulty,
      type: "difficulty",
    };
  }

  private parseStepsType(): ParsedStepsType {
    const token = this.consume();
    const match = token.value.match(stepsTypeRegexp);
    const t = match?.[1];
    if (!t) {
      throw Error(`Did not get steps type!`);
    }
    return {
      value: t,
      type: "stepsType",
    };
  }

  private parseTitle(): ParsedTitle {
    const token = this.consume();
    const match = token.value.match(titleRegexp);
    const t = match?.[1];
    if (!t) {
      throw Error(`Did not get title!`);
    }
    return {
      value: t,
      type: "title",
    };
  }

  private parseMeter(): ParsedMeter {
    const token = this.consume();
    const match = token.value.match(meterRegexp);
    const meter = match?.[1];
    if (!meter) {
      throw Error(`Did not get meter!`);
    }
    return {
      value: meter,
      type: "meter",
    };
  }

  private parseNotes(): ParsedNotes {
    const token = this.consume();
    if (token.value !== "#NOTES:") {
      throw Error(`Expected #NOTES:, got ${token.value}`);
    }

    let arr: string[] = [];

    while (!this.peek("endOfNotes")) {
      arr.push(this.consume().value);
    }

    const notes = arr.join("\n") + "\n,";

    return {
      value: notes,
      type: "notes",
    };
  }

  parse(): ParsedNode[] {
    while (this.tokens.length) {
      if (this.peek("difficulty")) {
        const node = this.parseDifficulty();
        this.nodes.push(node);
      } else if (this.peek("meter")) {
        const node = this.parseMeter();
        this.nodes.push(node);
      } else if (this.peek("notes")) {
        const node = this.parseNotes();
        this.nodes.push(node);
      } else if (this.peek("title")) {
        const node = this.parseTitle();
        this.nodes.push(node);
      } else if (this.peek("stepsType")) {
        const node = this.parseStepsType();
        this.nodes.push(node);
      } else if (this.peek("EOF")) {
        this.consume();
        const node = { type: "EOF" } as const;
        this.nodes.push(node);
      } else {
        this.consume();
      }
    }

    return this.nodes;
  }
}

interface ParsedChart {
  difficulty: ChartDifficulty;
  meter: string;
  raw: string;
}

interface Song {
  title: string;
  charts: ParsedChart[];
}

export function codegenSSC(nodes: ParsedNode[]): Song {
  let codegenSong: Song | undefined = undefined;

  const codegenCharts: Array<Partial<ParsedChart>> = [];
  let codegenChart: Partial<ParsedChart> = {};

  for (const n of nodes) {
    if (n.type === "title") {
      codegenSong = {
        title: n.value,
        charts: [],
      };
    }

    if (n.type === "difficulty") {
      codegenChart.difficulty = n.value;
    }

    if (n.type === "meter") {
      codegenChart.meter = n.value;
    }

    if (n.type === "notes") {
      codegenChart.raw = n.value;

      // assuming no malfomed ssc file
      // push chart and continue
      codegenCharts.push(codegenChart);
      codegenChart = {};
    }

    if (n.type === "EOF") {
      for (const c of codegenCharts) {
        if (!c.difficulty || !c.meter || !c.raw) {
          throw Error(`Malformed chart: ${JSON.stringify(c)}`);
        }
        codegenSong?.charts?.push({
          difficulty: c.difficulty,
          meter: c.meter,
          raw: c.raw,
        });
      }
    }
  }

  if (!codegenSong) {
    throw Error(`Song was not assigned, possible due to missing title of lack of EOF.`);
  }

  return codegenSong;
}
