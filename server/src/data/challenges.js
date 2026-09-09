// Pre-populated coding challenges for the AI Interview Coach platform

export const CODING_CHALLENGES = [
  {
    id: "chal-two-sum",
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    category: "Arrays & Hash Table",
    prompt: `### Problem Description
Given an array of integers \`nums\` and an integer \`target\`, return *indices of the two numbers such that they add up to \`target\`*.

You may assume that each input would have ***exactly one solution***, and you may not use the *same* element twice.

You can return the answer in any order.

#### Example 1:
\`\`\`
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].
\`\`\`

#### Example 2:
\`\`\`
Input: nums = [3,2,4], target = 6
Output: [1,2]
\`\`\`

#### Constraints:
- \`2 <= nums.length <= 10^4\`
- \`-10^9 <= nums[i] <= 10^9\`
- \`-10^9 <= target <= 10^9\`
- **Only one valid answer exists.**
`,
    starterCode: `function twoSum(nums, target) {
  // Write your code here
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
    testData: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] },
      { input: [[3, 3], 6], expected: [0, 1] },
      { input: [[-1, -2, -3, -4, -5], -8], expected: [2, 4] }
    ]
  },
  {
    id: "chal-valid-parentheses",
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    category: "Stacks & Strings",
    prompt: `### Problem Description
Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.

#### Example 1:
\`\`\`
Input: s = "()"
Output: true
\`\`\`

#### Example 2:
\`\`\`
Input: s = "()[]{}"
Output: true
\`\`\`

#### Example 3:
\`\`\`
Input: s = "(]"
Output: false
\`\`\`
`,
    starterCode: `function isValid(s) {
  // Write your solution here
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  
  for (const char of s) {
    if (char in map) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
    testData: [
      { input: ["()"], expected: true },
      { input: ["()[]{}"], expected: true },
      { input: ["(]"], expected: false },
      { input: ["([)]"], expected: false },
      { input: ["{[]}"], expected: true },
      { input: [""], expected: true }
    ]
  },
  {
    id: "chal-longest-substring",
    slug: "longest-substring-without-repeating-characters",
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    category: "Sliding Window",
    prompt: `### Problem Description
Given a string \`s\`, find the length of the **longest substring** without repeating characters.

#### Example 1:
\`\`\`
Input: s = "abcabcbb"
Output: 3
Explanation: The answer is "abc", with the length of 3.
\`\`\`

#### Example 2:
\`\`\`
Input: s = "bbbbb"
Output: 1
Explanation: The answer is "b", with the length of 1.
\`\`\`

#### Example 3:
\`\`\`
Input: s = "pwwkew"
Output: 3
Explanation: The answer is "wke", with the length of 3.
\`\`\`
`,
    starterCode: `function lengthOfLongestSubstring(s) {
  // Write your sliding window solution here
  let maxLength = 0;
  let left = 0;
  const set = new Set();
  
  for (let right = 0; right < s.length; right++) {
    while (set.has(s[right])) {
      set.delete(s[left]);
      left++;
    }
    set.add(s[right]);
    maxLength = Math.max(maxLength, right - left + 1);
  }
  return maxLength;
}`,
    testData: [
      { input: ["abcabcbb"], expected: 3 },
      { input: ["bbbbb"], expected: 1 },
      { input: ["pwwkew"], expected: 3 },
      { input: [""], expected: 0 },
      { input: [" "], expected: 1 },
      { input: ["dvdf"], expected: 3 }
    ]
  },
  {
    id: "chal-merge-intervals",
    slug: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    category: "Arrays & Sorting",
    prompt: `### Problem Description
Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals, and return *an array of the non-overlapping intervals that cover all the intervals in the input*.

#### Example 1:
\`\`\`
Input: intervals = [[1,3],[2,6],[8,10],[15,18]]
Output: [[1,6],[8,10],[15,18]]
Explanation: Since intervals [1,3] and [2,6] overlap, merge them into [1,6].
\`\`\`

#### Example 2:
\`\`\`
Input: intervals = [[1,4],[4,5]]
Output: [[1,5]]
Explanation: Intervals [1,4] and [4,5] are considered overlapping.
\`\`\`
`,
    starterCode: `function merge(intervals) {
  // Write your solution here
  if (!intervals.length) return [];
  intervals.sort((a, b) => a[0] - b[0]);
  
  const merged = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const current = intervals[i];
    const last = merged[merged.length - 1];
    
    if (current[0] <= last[1]) {
      last[1] = Math.max(last[1], current[1]);
    } else {
      merged.push(current);
    }
  }
  return merged;
}`,
    testData: [
      { input: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expected: [[1, 6], [8, 10], [15, 18]] },
      { input: [[[1, 4], [4, 5]]], expected: [[1, 5]] },
      { input: [[[6, 8], [1, 9], [2, 4], [4, 7]]], expected: [[1, 9]] }
    ]
  },
  {
    id: "chal-debounce",
    slug: "implement-debounce",
    title: "Implement Debounce Function",
    difficulty: "Medium",
    category: "JavaScript & Closures",
    prompt: `### Problem Description
Implement a \`debounce\` function that takes a function \`fn\` and a delay in milliseconds \`t\`.
The debounced function should delay invoking \`fn\` until after \`t\` milliseconds have elapsed since the last time the debounced function was invoked.

#### Example:
\`\`\`javascript
const log = debounce((val) => console.log(val), 50);
log('hello'); // cancelled if invoked again within 50ms
\`\`\`
`,
    starterCode: `function debounce(fn, t) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, t);
  };
}`,
    testData: [
      { input: [50], expected: "function" }
    ]
  }
];
