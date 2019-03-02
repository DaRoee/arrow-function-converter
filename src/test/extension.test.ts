import * as assert from "assert";
import { transformToMutiline } from "../extension";

suite("Extension Tests", function() {
  test("simple transformation", function() {
    const tabNum = 0;
    const text = "[1, 2, 3].map(x => x * 2);";
    const result = "[1, 2, 3].map(x => {\n\t\n\treturn x * 2;\n});";
    assert.equal(transformToMutiline(tabNum, text), result);
  });

  test("indented code transformation", function() {
    const tabNum = 2;
    const tabsMultiplied = "\t".repeat(tabNum);
    const text = `${tabsMultiplied}[1, 2, 3].map(x => x * 2);`;
    const result = `${tabsMultiplied}[1, 2, 3].map(x => {\n${tabsMultiplied}\t\n${tabsMultiplied}\treturn x * 2;\n${tabsMultiplied}});`;
    assert.equal(transformToMutiline(tabNum, text), result);
  });

  test("function returns a function", function() {
    const tabNum = 0;
    const text = "[1, 2, 3].map(x => () => x * 2);";
    const result = "[1, 2, 3].map(x => {\n\t\n\treturn () => x * 2;\n});";
    assert.equal(transformToMutiline(tabNum, text), result);
  });

  test("multiple function calls in the same line", function() {
    const tabNum = 0;
    const text = "this.firstFunc().pipe(tap(x => this.secondFunc({ x })));";
    const result = "this.firstFunc().pipe(tap(x => {\n\t\n\treturn this.secondFunc({ x });\n}));";
    assert.equal(transformToMutiline(tabNum, text), result);
  });

  test("reduce with multiple parameters", function() {
    const tabNum = 0;
    const text = "const sum = someArr.reduce((sum, item) => sum + item, 0);";
    const result = "const sum = someArr.reduce((sum, item) => {\n\t\n\treturn sum + item;\n}, 0);";
    assert.equal(transformToMutiline(tabNum, text), result);
  });

  test("function with types", function() {
    const tabNum = 0;
    const text = "combineLatest(func1, func2).subscribe(([val1, val2]: [number, string]) => `${val1}${val2}`)";
    const result = "combineLatest(func1, func2).subscribe(([val1, val2]: [number, string]) => {\n\t\n\t return `${val1}${val2}`\n})";
    assert.equal(transformToMutiline(tabNum, text), result);
  });

  test.skip("should not add a semicolon if function is part of some chaining", function() {
    // const tabNum = 0;
    // const text = `Promise.reject("")\n\t.then(res => res.json())\n\t.then(attr => ({ data: { id: userId, attr } }));`;
  });
});
