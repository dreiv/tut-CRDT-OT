import { diff_match_patch } from "diff-match-patch";

// Initialize the OT engine
const dmp = new diff_match_patch();

const INITIAL_TEXT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

// DOM Elements
const text1El = document.getElementById("text-1") as HTMLTextAreaElement;
const text2El = document.getElementById("text-2") as HTMLTextAreaElement;
const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement;
const processBtn = document.getElementById("process-btn") as HTMLButtonElement;
const outputEl = document.getElementById("final-text") as HTMLParagraphElement;

// Helper to reset the text areas
function resetText() {
  text1El.value = INITIAL_TEXT;
  text2El.value = INITIAL_TEXT;
  outputEl.innerHTML = "Merge results will appear here...";
}

// Initialize on load
resetText();
resetBtn.addEventListener("click", resetText);

// Process the Reconciliation (Operational Transformation approach)
processBtn.addEventListener("click", () => {
  const user1Text = text1El.value;
  const user2Text = text2El.value;

  const diff1 = dmp.diff_main(INITIAL_TEXT, user1Text);
  const diff2 = dmp.diff_main(INITIAL_TEXT, user2Text);

  // Clean up the diffs for better patch generation (increases human readability)
  dmp.diff_cleanupSemantic(diff1);
  dmp.diff_cleanupSemantic(diff2);

  const patch1 = dmp.patch_make(INITIAL_TEXT, diff1);
  const patch2 = dmp.patch_make(INITIAL_TEXT, diff2);

  const [mergedText1] = dmp.patch_apply(patch1, INITIAL_TEXT);
  const [finalMergedText, results] = dmp.patch_apply(patch2, mergedText1);

  // Generate a visual diff between the original text and the final reconciled text
  // so we can see the "marked blocks" visually as requested.
  const finalDiff = dmp.diff_main(INITIAL_TEXT, finalMergedText);
  dmp.diff_cleanupSemantic(finalDiff);

  // dmp.diff_prettyHtml generates a string with <ins> and <del> tags for visual marking
  const htmlOutput = dmp.diff_prettyHtml(finalDiff);

  outputEl.innerHTML = htmlOutput;
});
