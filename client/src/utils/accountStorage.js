const ACCOUNT_ID_KEY = "fittrack-user-id";
const ACCOUNT_EMAIL_KEY = "fittrack-user-email";
const PRESERVED_ACCOUNT_EMAIL = "keerthypriyanndhc@gmail.com";

const legacyDataKeys = [
  "fittrack-goals",
  "fittrack-workouts",
  "fittrack-weight-entries",
];

export function setAccountIdentity(user) {
  const userId = String(user.id || user._id || "");
  const email = typeof user.email === "string" ? user.email.trim().toLowerCase() : "";
  if (!userId || !email) {
    throw new Error("The signed-in account is missing its ID or email.");
  }

  localStorage.setItem(ACCOUNT_ID_KEY, userId);
  localStorage.setItem(ACCOUNT_EMAIL_KEY, email);

  if (email === PRESERVED_ACCOUNT_EMAIL) {
    for (const legacyKey of legacyDataKeys) {
      const accountKey = getAccountStorageKey(legacyKey);
      if (!localStorage.getItem(accountKey)) {
        const legacyValue = localStorage.getItem(legacyKey);
        if (legacyValue) localStorage.setItem(accountKey, legacyValue);
      }
    }
  }
}

export function clearAccountIdentity() {
  localStorage.removeItem(ACCOUNT_ID_KEY);
  localStorage.removeItem(ACCOUNT_EMAIL_KEY);
}

export function getAccountStorageKey(key) {
  const userId = localStorage.getItem(ACCOUNT_ID_KEY);
  return `${key}:${userId || "guest"}`;
}

export function isPreservedAccount() {
  return localStorage.getItem(ACCOUNT_EMAIL_KEY)?.toLowerCase() === PRESERVED_ACCOUNT_EMAIL;
}
