function levenshteinDistance(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();

  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prevRow = Array.from({ length: b.length + 1 }, (_, i) => i);
  
  for (let i = 0; i < a.length; i++) {
    const currentRow = [i + 1];
    
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      currentRow[j + 1] = Math.min(
        prevRow[j + 1] + 1,
        currentRow[j] + 1,
        prevRow[j] + cost
      );
    }
    
    prevRow = currentRow;
  }

  return prevRow[b.length];
}

export function fuzzySearch(input: string, items: any[], field: string): any[] {
    const inputLower = input.toLowerCase();
    const inputChars = inputLower.split('');

    return items
        .map(item => {
            const itemField = item[field].toLowerCase();
            const itemChars = itemField.split('');

            // 1. Check ordered characters presence
            let searchIndex = 0;
            const matches: number[] = [];
            
            // Find positions of input characters in order
            for (const [idx, char] of itemChars.entries()) {
                if (char === inputChars[searchIndex]) {
                    matches.push(idx);
                    searchIndex++;
                    if (searchIndex === inputChars.length) break;
                }
            }
            
            const hasOrderedMatch = searchIndex === inputChars.length;
            const matchSpread = hasOrderedMatch 
                ? matches[matches.length - 1] - matches[0]
                : Infinity;

            // 2. Calculate prefix matches
            let prefixMatch = 0;
            while (prefixMatch < inputChars.length && 
                   itemChars[prefixMatch] === inputChars[prefixMatch]) {
                prefixMatch++;
            }

            // 3. Levenshtein distance with bonus for ordered matches
            let distance = levenshteinDistance(inputLower, itemField);
            if (hasOrderedMatch) {
                distance = Math.max(0, distance - inputChars.length * 2);
            }

            return {
                item,
                hasOrderedMatch,
                matchSpread,
                prefixMatch,
                distance,
                itemField,
                matches
            };
        })
        .filter(entry => {
            const MIN_MATCH_CHARS = Math.max(2, Math.floor(inputChars.length * 0.5));

            // 1. Check for minimum number of matches and distance
            const hasMinimumMatch = entry.matches.length >= MIN_MATCH_CHARS

            // 2. Mandatory condition: at least partial match of the prefix
            const hasPrefix = entry.prefixMatch >= Math.min(2, inputChars.length)

            // 3. We combine conditions using and, add a prefix check
            return (hasMinimumMatch || entry.hasOrderedMatch) && hasPrefix
        })
        .sort((a, b) => {
            // Priority 1: Full exact match
            if (a.itemField === inputLower) return -1
            if (b.itemField === inputLower) return 1

            // Priority 2: Prefix match length
            if (a.prefixMatch !== b.prefixMatch) {
                return b.prefixMatch - a.prefixMatch;
            }

            // Priority 3: Has ordered characters match
            if (a.hasOrderedMatch !== b.hasOrderedMatch) {
                return b.hasOrderedMatch ? 1 : -1;
            }

            // Priority 4: Match spread (tighter clusters first)
            if (a.hasOrderedMatch && b.hasOrderedMatch) {
                if (a.matchSpread !== b.matchSpread) {
                    return a.matchSpread - b.matchSpread;
                }
                
                // If same spread, earlier matches first
                return a.matches[0] - b.matches[0];
            }

            // Priority 5: Levenshtein distance
            if (a.distance !== b.distance) {
                const aScore = a.distance * 0.4 + a.matchSpread * 0.3 + (a.prefixMatch * 0.3)
                const bScore = b.distance * 0.4 + b.matchSpread * 0.3 + (b.prefixMatch * 0.3)
                return aScore - bScore
            }

            // Priority 6: Alphabetical order
            return a.itemField.localeCompare(b.itemField);
        })
        .map(entry => entry.item);
}
