import { describe, it, expect } from "vitest";
import fs from "fs";
import { codegenSSC, SSCParser, tokenizeSSC } from "./sscParser";
import path from "path";

const tokenize = () => {
  const data = fs.readFileSync(
    path.join("resources", "ace-for-aces.ssc"),
    "utf-8"
  );

  return tokenizeSSC(data);
};

describe("tokenizeSSC", () => {
  it("works", () => {
    expect(tokenize()).toMatchSnapshot();
  });
});

describe("parseSSC", () => {
  it("works", () => {
    const tokens = tokenize();
    const parsed = new SSCParser(tokens);

    expect(parsed.parse()).toMatchSnapshot();
  });
});

describe("codegenSSC", () => {
  it("works", () => {
    const tokens = tokenize();
    const parsed = new SSCParser(tokens).parse();
    const codeGen = codegenSSC(parsed);
    expect(codeGen).toMatchSnapshot();
  });
});
