// Luhn checksum helpers used only to generate/validate FAKE demo card numbers.
// These are not tied to any real card network and are never charged anywhere.

function luhnChecksumDigit(digitsWithoutCheck) {
  let sum = 0;
  let alternate = true; // rightmost of the existing digits is doubled first
  for (let i = digitsWithoutCheck.length - 1; i >= 0; i--) {
    let digit = Number(digitsWithoutCheck[i]);
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    alternate = !alternate;
  }
  return (10 - (sum % 10)) % 10;
}

function isValidLuhn(fullNumber) {
  const digits = fullNumber.split("");
  const checkDigit = Number(digits.pop());
  const computed = luhnChecksumDigit(digits.join(""));
  return checkDigit === computed;
}

module.exports = { luhnChecksumDigit, isValidLuhn };
