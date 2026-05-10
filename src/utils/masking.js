export const maskSSN = (ssn) => {
  if (!ssn || ssn.length < 4) return ssn;
  const clean = ssn.replace(/\D/g, '');
  if (clean.length === 9) {
    return `●●●-●●-${clean.slice(-4)}`;
  }
  // Fallback for partial or malformed
  return '●●●-●●-●●●●';
};

export const maskAccountNumber = (account) => {
  if (!account || account.length < 4) return account;
  const clean = account.replace(/\D/g, '');
  return `●●●●●●●${clean.slice(-4)}`;
};
