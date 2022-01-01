import fs from "fs";
import path from "path";
import { parse, analyzePatterns, createAnalysisResults } from "./src/analysis";
import { patterns } from "./src/patterns";

const data = fs.readFileSync(path.join(__dirname, "simple.txt"), "utf-8");

const parsed = parse(data)
const values = createAnalysisResults(patterns)
const analysis = analyzePatterns(values, parsed, patterns)

console.log(analysis)