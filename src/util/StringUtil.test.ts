import StringUtil from "./StringUtil";

describe("StringUtil", () => {
  it("gets first uppercase letter from input", () => {
    const input = "sallyowner";
    const result = StringUtil.getFirstUppercase(input);
    expect(result).toBe("S");
  });

  it("should create a valid uuid", () => {
    const result = StringUtil.getUuidv4();
    console.log(result);
    expect(result).toBeTruthy();
  });

  it("should compress the string", async () => {
    const input = "test string";
    const output = await StringUtil.zipString(input);
    console.log(output);
  });
});
