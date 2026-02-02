export function formatDate(dateInput: string | Date): string {
  // Regex to match: "Dec 20, 2025"
  const formattedDateRegex =
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{1,2},\s\d{4}$/;

  // If it's already a formatted string, return as-is
  if (typeof dateInput === "string" && formattedDateRegex.test(dateInput)) {
    return dateInput;
  }

  const date = new Date(dateInput);

  // Guard against invalid dates
  if (isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
