import fs from "fs";
import util from "util";
import path from "path";
import { parse, analyzePatterns, createAnalysisResults } from "./src/analysis";
import { patterns } from "./src/patterns";

const resource = process.argv.slice(2)[0];

// TODO pick up from this command
// b && yarn ts-node play.ts resources/pattern-overlap-8th-16th.txt
const data = fs.readFileSync(
  path.join(__dirname, resource),
  "utf-8"
);

const parsed = parse(data);
const values = createAnalysisResults(patterns);
const analysis = analyzePatterns(values, parsed, patterns);

for (const pattern of Object.keys(patterns)) {
  const data = analysis[pattern].collection;
  console.log(`\nPattern: ${pattern}`);

  if (data.size === 0) {
    console.log("None found.");
  } else {
    for (const [k, v] of data) {
      const firstNote = v.containedNotePositionsInMeasure[0]!
      console.log(
        `Pattern starting m${firstNote.measureNumber} n${firstNote.notePosInMeasure}`
      );
    }
  }
}

console.log(analysis) // ['dru-candle']) // ['urd-candle'].collection);
