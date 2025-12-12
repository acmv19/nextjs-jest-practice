const isPalindrome = require("./isPalindrome");

test("tacocat returns true", () => {
  expect(isPalindrome("tacocat")).toBe(true);
});

test("dave returns false", () => {
  expect(isPalindrome("dave")).toBe(false);
});
