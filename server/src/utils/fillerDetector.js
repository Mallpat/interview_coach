/**
 * Advanced Word-Boundary and Context-Aware Filler Word & Speech Analytics Engine
 */

// Multi-word phrases checked first to avoid partial-match fragmentation
const MULTI_WORD_FILLERS = [
  { phrase: 'you know', regex: /\byou\s+know\b/gi },
  { phrase: 'i mean', regex: /\bi\s+mean\b/gi },
  { phrase: 'sort of', regex: /\bsort\s+of\b/gi },
  { phrase: 'kind of', regex: /\bkind\s+of\b/gi }
];

// Single word vocal hesitation fillers (always considered fillers in spoken transcripts)
const VOCAL_HESITATION_FILLERS = [
  { phrase: 'um', regex: /\bum+\b/gi },
  { phrase: 'uh', regex: /\buh+\b/gi },
  { phrase: 'er', regex: /\ber+\b/gi },
  { phrase: 'ah', regex: /\bah+\b/gi }
];

/**
 * Check if "like" is used as a filler vs legitimate grammatical usage.
 * Legitimate usage:
 * - "I like", "they like", "we like", "would like" (verb)
 * - "looks like", "feels like", "acts like", "sound like", "seems like" (comparison)
 * - "such as", "things like", "tools like", "languages like" (examples)
 * Filler usage:
 * - ", like ," (hesitation pause)
 * - sentence/clause starter: "^like ", "and like ", "so like "
 * - mid-sentence hedge: "it was like really fast", "we had like 50 bugs"
 */
export const isLikeFiller = (fullText, matchIndex, matchLength) => {
  const before = fullText.slice(Math.max(0, matchIndex - 35), matchIndex).toLowerCase();
  const after = fullText.slice(matchIndex + matchLength, matchIndex + matchLength + 35).toLowerCase();

  // Legitimate verb forms
  if (/(?:i|we|they|you|he|she|would|should|could|might|to|did|do|does)\s+$/i.test(before)) {
    return false;
  }

  // Legitimate comparison verbs ("looks like", "feels like", "sound like", "just like", "much like")
  if (/(?:look|looks|looked|feel|feels|felt|sound|sounds|sounded|act|acts|acted|seem|seems|seemed|is|are|was|were|just|much|more|less)\s+$/i.test(before)) {
    return false;
  }

  // Legitimate example lists ("queues like Kafka", "tools like Docker", "languages like Go")
  if (/\b(?:something|anything|nothing|things|tools|libraries|frameworks|languages|services|databases|tables|apis|components|metrics|systems|queues|brokers|servers|clusters|patterns|caches|technologies|platforms|solutions|[a-z]{3,}s)\s+$/i.test(before)) {
    return false;
  }

  // Proper noun / capitalized technology example right after ("like Kafka", "like Redis", "like Postgres")
  const originalAfter = fullText.slice(matchIndex + matchLength, matchIndex + matchLength + 35);
  if (/^\s+[A-Z][a-zA-Z0-9_]*/.test(originalAfter)) {
    return false;
  }

  // If preceded by a comma, hyphen, pause, or clause starter: high probability filler
  if (/(?:^|[,\.\-\—\–\?\!]\s*|\b(?:and|so|well|but|then)\s+)$/i.test(before)) {
    return true;
  }

  // If followed by a number or vague intensifier without comparison: "like 10 times", "like really"
  if (/^\s*(?:really|totally|actually|basically|probably|maybe|\d+)/i.test(after)) {
    return true;
  }

  // If surrounded by punctuation / standalone
  if (/[,\.\?!]\s*$/i.test(before) || /^\s*[,\.\?!]/.test(after)) {
    return true;
  }

  // Default: if it doesn't clearly match a legitimate grammatical role, count as filler
  return true;
};

/**
 * Check if "actually" is used as empty filler vs emphatic/factual adverb
 * Legitimate: "it actually improved latency", "which actually solved the bug"
 * Filler: "actually, um", "so actually,", "well, actually,", standalone hedge
 */
export const isActuallyFiller = (fullText, matchIndex, matchLength) => {
  const before = fullText.slice(Math.max(0, matchIndex - 25), matchIndex).toLowerCase();
  const after = fullText.slice(matchIndex + matchLength, matchIndex + matchLength + 25).toLowerCase();

  // Filler when starting sentence or accompanied by hesitation / pause: "Actually, ...", ", actually,"
  if (/(?:^|[,\.\?!]\s*|\b(?:and|so|well|but)\s+)$/i.test(before) && /^\s*[,\.\?!]/.test(after)) {
    return true;
  }
  if (/^\s*(?:um|uh|er|ah|you know|basically|like)\b/i.test(after)) {
    return true;
  }
  if (/(?:um|uh|er|ah|like)\s*$/i.test(before)) {
    return true;
  }

  // If directly followed by a verb ("actually increased", "actually resolved"), legitimate adverb
  if (/^\s+[a-z]+(?:ed|ing|s)?\b/i.test(after) && !/^\s+(?:is|was|are|were|be|been)\b/i.test(after)) {
    return false;
  }

  return false;
};

/**
 * Extract snippet context around match
 */
const extractSnippet = (text, start, length, padding = 20) => {
  const snippetStart = Math.max(0, start - padding);
  const snippetEnd = Math.min(text.length, start + length + padding);
  const prefix = snippetStart > 0 ? '...' : '';
  const suffix = snippetEnd < text.length ? '...' : '';
  return `${prefix}${text.slice(snippetStart, snippetEnd).trim()}${suffix}`;
};

/**
 * Detect all filler words with strict boundary awareness, contextual checks, and speech metrics
 */
export const analyzeFillersAndSpeech = (transcript = '', durationSeconds = 0) => {
  if (!transcript || typeof transcript !== 'string') {
    return {
      totalFillerCount: 0,
      fillerPenalty: 0,
      fillerBreakdown: {},
      occurrences: [],
      speechAnalytics: {
        totalWords: 0,
        durationSeconds: durationSeconds || 0,
        wordsPerMinute: 0,
        fillerPercentage: 0,
        averageSentenceLength: 0,
        paceStatus: 'No Speech Detected',
        paceEvaluation: 'Insufficient audio duration or empty transcript to determine speaking pace.'
      }
    };
  }

  const cleanText = transcript.trim();
  const words = cleanText.split(/\s+/).filter(Boolean);
  const totalWords = words.length;

  // Sentences
  const sentences = cleanText.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
  const averageSentenceLength = sentences.length > 0 ? Math.round(totalWords / sentences.length) : totalWords;

  // Track matched character spans to prevent overlapping double counts
  const matchedSpans = [];
  const isSpanOverlapping = (start, end) => {
    return matchedSpans.some(span => (start >= span.start && start < span.end) || (end > span.start && end <= span.end));
  };

  const occurrences = [];
  const fillerBreakdown = {};

  const recordOccurrence = (phrase, start, end) => {
    matchedSpans.push({ start, end });
    const count = (fillerBreakdown[phrase] || 0) + 1;
    fillerBreakdown[phrase] = count;
    occurrences.push({
      phrase,
      startIndex: start,
      endIndex: end,
      snippet: extractSnippet(cleanText, start, end - start)
    });
  };

  // 1. Check Multi-Word Fillers first (prevents "you know" from matching partial tokens)
  for (const { phrase, regex } of MULTI_WORD_FILLERS) {
    let match;
    const re = new RegExp(regex);
    while ((match = re.exec(cleanText)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (!isSpanOverlapping(start, end)) {
        recordOccurrence(phrase, start, end);
      }
    }
  }

  // 2. Check Vocal Hesitations (um, uh, er, ah)
  for (const { phrase, regex } of VOCAL_HESITATION_FILLERS) {
    let match;
    const re = new RegExp(regex);
    while ((match = re.exec(cleanText)) !== null) {
      const start = match.index;
      const end = start + match[0].length;
      if (!isSpanOverlapping(start, end)) {
        recordOccurrence(phrase, start, end);
      }
    }
  }

  // 3. Check "basically" (almost exclusively used as filler in speech)
  const basicallyRegex = /\bbasically\b/gi;
  let bMatch;
  while ((bMatch = basicallyRegex.exec(cleanText)) !== null) {
    const start = bMatch.index;
    const end = start + bMatch[0].length;
    if (!isSpanOverlapping(start, end)) {
      recordOccurrence('basically', start, end);
    }
  }

  // 4. Check "like" with Contextual Filter
  const likeRegex = /\blike\b/gi;
  let lMatch;
  while ((lMatch = likeRegex.exec(cleanText)) !== null) {
    const start = lMatch.index;
    const end = start + lMatch[0].length;
    if (!isSpanOverlapping(start, end)) {
      if (isLikeFiller(cleanText, start, lMatch[0].length)) {
        recordOccurrence('like', start, end);
      }
    }
  }

  // 5. Check "actually" with Contextual Filter
  const actuallyRegex = /\bactually\b/gi;
  let aMatch;
  while ((aMatch = actuallyRegex.exec(cleanText)) !== null) {
    const start = aMatch.index;
    const end = start + aMatch[0].length;
    if (!isSpanOverlapping(start, end)) {
      if (isActuallyFiller(cleanText, start, aMatch[0].length)) {
        recordOccurrence('actually', start, end);
      }
    }
  }

  const totalFillerCount = occurrences.length;

  // Project Penalty Rule: Filler Penalty = min(15, Filler Count * 1.5)
  const fillerPenalty = Math.min(15, Number((totalFillerCount * 1.5).toFixed(1)));

  // Speech Analytics:
  // Duration in minutes
  const effectiveDurationSeconds = durationSeconds > 0 ? durationSeconds : Math.max(10, Math.round(totalWords / 2.3)); // fallback estimation if no timer
  const minutes = effectiveDurationSeconds / 60;
  const wordsPerMinute = minutes > 0 ? Math.round(totalWords / minutes) : 0;
  const fillerPercentage = totalWords > 0 ? Number(((totalFillerCount / totalWords) * 100).toFixed(1)) : 0;
  const fillersPerMinute = minutes > 0 ? Number((totalFillerCount / minutes).toFixed(1)) : 0;

  // Pace Classification against 120-160 WPM Target
  let paceStatus = 'Optimal';
  let paceEvaluation = 'Your speaking pace is within the ideal 120–160 WPM interview range.';

  if (wordsPerMinute < 100) {
    paceStatus = 'Slow';
    paceEvaluation = 'Your speaking pace is below 100 WPM. Aim for 120–160 WPM for energetic delivery.';
  } else if (wordsPerMinute < 120) {
    paceStatus = 'Deliberate';
    paceEvaluation = 'Slightly below the ideal 120–160 WPM range. Clear, but could pick up slight momentum.';
  } else if (wordsPerMinute > 180) {
    paceStatus = 'Very Fast';
    paceEvaluation = 'Above 180 WPM. Slow down slightly to give listeners time to absorb complex technical details.';
  } else if (wordsPerMinute > 160) {
    paceStatus = 'Brisk';
    paceEvaluation = 'Slightly above the ideal 160 WPM ceiling. Good energy, but ensure clear articulation.';
  }

  return {
    totalFillerCount,
    fillerPenalty,
    fillerBreakdown,
    occurrences,
    speechAnalytics: {
      totalWords,
      durationSeconds: effectiveDurationSeconds,
      wordsPerMinute,
      fillersPerMinute,
      fillerPercentage,
      averageSentenceLength,
      paceStatus,
      paceEvaluation
    }
  };
};
