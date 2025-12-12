function isPalindrome(word) {
  const cleaned = word.toLowerCase().replaceAll(" ", "");
  const reversed = cleaned.split("").reverse().join("");

  return cleaned === reversed;
}

module.exports = isPalindrome;
