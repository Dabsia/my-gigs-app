// export function getInitials(name: string): string {
//   const words = name?.trim()?.split(/\s+/);

//   if (words.length === 1) {
//     return words[0][0]?.toUpperCase();
//   }

//   if (words.length > 2) {
//     return (words[0][0] + words[1][0])?.toUpperCase();
//   }

//   return (words[0][0] + words[1][0])?.toUpperCase();
// }

export function getInitials(name: string): string {
  // Handle undefined, null, or empty string
  if (!name || typeof name !== "string") {
    return "";
  }

  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  // Handle empty array after filtering
  if (words.length === 0) {
    return "";
  }

  // If just one word, return first letter
  if (words.length === 1) {
    return words[0][0].toUpperCase();
  }

  // If 2 or more words, return first letters of first two words
  return (words[0][0] + words[1][0]).toUpperCase();
}

export const getFirstName = (name: string) => {
  if (!name || typeof name !== "string") {
    return "";
  }
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0);

  // Handle empty array after filtering
  if (words.length === 0) {
    return "";
  }

  // If just one word, return first letter
  if (words.length === 1) {
    return words[0];
  }
  if (words.length > 1) {
    return words[0];
  }
};
