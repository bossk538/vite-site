const crypto = require("crypto");
const { luhnChecksumDigit } = require("./luhn");

// Every generated number starts with 9999 - an IIN range that ISO/IEC 7812
// reserves and no real card network issues from. This makes it obvious at a
// glance that a number came from this demo and can never be a real card.
const DEMO_BIN = "9999";
const NUMBER_LENGTH = 16;

function generateFakeCardNumber() {
  let digits = DEMO_BIN;
  const randomDigitsNeeded = NUMBER_LENGTH - DEMO_BIN.length - 1; // leave room for check digit
  for (let i = 0; i < randomDigitsNeeded; i++) {
    digits += crypto.randomInt(0, 10).toString();
  }
  const checkDigit = luhnChecksumDigit(digits);
  return digits + checkDigit;
}

function maskCardNumber(fullNumber) {
  const last4 = fullNumber.slice(-4);
  return `${DEMO_BIN} •••• •••• ${last4}`;
}

function generateExpiry(yearsFromNow = 3) {
  const now = new Date();
  const year = now.getFullYear() + yearsFromNow;
  const month = now.getMonth() + 1; // same month, N years out
  return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
}

function generateFakeCvv() {
  // Returned to the caller once at issuance and never persisted anywhere,
  // mirroring the real-world rule that CVVs are never stored after use.
  return String(crypto.randomInt(0, 1000)).padStart(3, "0");
}

module.exports = { generateFakeCardNumber, maskCardNumber, generateExpiry, generateFakeCvv, DEMO_BIN };
