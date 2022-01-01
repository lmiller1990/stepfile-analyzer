import fs from "fs";
import path from "path";
import { parse, analyzePatterns, patterns, createAnalysisResults } from "./index";

const data = fs.readFileSync(path.join(__dirname, "simple.txt"), "utf-8");

const parsed = parse(data)
const values = createAnalysisResults()
const analysis = analyzePatterns(values, parsed, patterns)

console.log(analysis)