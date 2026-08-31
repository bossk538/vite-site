// Simplified, deterministic "underwriting" for demo purposes only.
// This is NOT real credit-risk modeling - it exists to make card issuance in
// the demo feel grounded without pretending to be a real decisioning engine.

const MIN_LIMIT = 500;
const MAX_LIMIT = 25000;

function decideCreditLimit({ annualIncome, requestedLimit }) {
  const income = Math.max(0, Number(annualIncome) || 0);
  const requested = Math.max(0, Number(requestedLimit) || 0);

  // Rule of thumb: never extend more than ~15% of stated annual income,
  // and never more than the applicant asked for.
  const incomeBasedCap = income * 0.15;
  let approvedLimit = Math.min(requested, incomeBasedCap);

  approvedLimit = Math.max(MIN_LIMIT, Math.min(MAX_LIMIT, approvedLimit));
  approvedLimit = Math.round(approvedLimit / 50) * 50; // round to nearest $50

  const approved = income >= 10000 && approvedLimit >= MIN_LIMIT;

  return {
    approved,
    approvedLimit: approved ? approvedLimit : 0,
    reason: approved
      ? null
      : income < 10000
      ? "annual income below minimum threshold"
      : "unable to extend minimum credit line",
  };
}

module.exports = { decideCreditLimit, MIN_LIMIT, MAX_LIMIT };
