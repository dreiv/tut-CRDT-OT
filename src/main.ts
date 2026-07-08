import { diff_match_patch } from "diff-match-patch";

// Initialize the Operational Transformation Engine
const dmp = new diff_match_patch();

const INITIAL_TEXT =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

// ==========================================
// 1. OPERATIONAL TRANSFORMATION DOM & LOGIC
// ==========================================
const text1El = document.getElementById("text-1") as HTMLTextAreaElement;
const text2El = document.getElementById("text-2") as HTMLTextAreaElement;
const resetBtn = document.getElementById("reset-btn") as HTMLButtonElement;
const processBtn = document.getElementById("process-btn") as HTMLButtonElement;
const diffTextEl = document.getElementById("diff-text") as HTMLDivElement;
const cleanTextEl = document.getElementById(
  "clean-text",
) as HTMLParagraphElement;

function resetText() {
  text1El.value = INITIAL_TEXT;
  text2El.value = INITIAL_TEXT;
  diffTextEl.innerHTML = "Click process to parse mutations...";
  cleanTextEl.textContent =
    "Click process to view production string compilation...";
}

// Initialize OT Section
resetText();
resetBtn.addEventListener("click", resetText);

processBtn.addEventListener("click", () => {
  const user1Text = text1El.value;
  const user2Text = text2El.value;

  // Compute Operations (Diffs from common baseline)
  const diff1 = dmp.diff_main(INITIAL_TEXT, user1Text);
  const diff2 = dmp.diff_main(INITIAL_TEXT, user2Text);

  dmp.diff_cleanupSemantic(diff1);
  dmp.diff_cleanupSemantic(diff2);

  // Translate Diffs to operational transformations (Patches)
  const patch1 = dmp.patch_make(INITIAL_TEXT, diff1);
  const patch2 = dmp.patch_make(INITIAL_TEXT, diff2);

  // Apply sequential changes concurrently via position shifting rules
  const [mergedText1] = dmp.patch_apply(patch1, INITIAL_TEXT);
  const [finalMergedText] = dmp.patch_apply(patch2, mergedText1);

  // Display View A: Visual markup diff relative to original text
  const finalDiff = dmp.diff_main(INITIAL_TEXT, finalMergedText);
  dmp.diff_cleanupSemantic(finalDiff);
  diffTextEl.innerHTML = dmp.diff_prettyHtml(finalDiff);

  // Display View B: Clean reconciled text output without markup symbols
  cleanTextEl.textContent = finalMergedText;
});

// ==========================================
// 2. CRDT PN-COUNTER SIMULATION LOGIC
// ==========================================
interface CounterState {
  increments: Record<string, number>;
  decrements: Record<string, number>;
}

// Node State structures tracking independent registers
let nodeAState: CounterState = {
  increments: { A: 0, B: 0 },
  decrements: { A: 0, B: 0 },
};
let nodeBState: CounterState = {
  increments: { A: 0, B: 0 },
  decrements: { A: 0, B: 0 },
};

// DOM Selectors for CRDT Matrix
const nodeAValEl = document.getElementById("node-a-val") as HTMLSpanElement;
const nodeAStateEl = document.getElementById("node-a-state") as HTMLDivElement;
const nodeBValEl = document.getElementById("node-b-val") as HTMLSpanElement;
const nodeBStateEl = document.getElementById("node-b-state") as HTMLDivElement;

const nodeAIncBtn = document.getElementById("node-a-inc") as HTMLButtonElement;
const nodeADecBtn = document.getElementById("node-a-dec") as HTMLButtonElement;
const nodeBIncBtn = document.getElementById("node-b-inc") as HTMLButtonElement;
const nodeBDecBtn = document.getElementById("node-b-dec") as HTMLButtonElement;

const syncCrdtBtn = document.getElementById(
  "sync-crdt-btn",
) as HTMLButtonElement;
const globalCrdtValEl = document.getElementById(
  "global-crdt-val",
) as HTMLSpanElement;

// Compute local matrix visibility sum
function getLocalValue(state: CounterState): number {
  const incSum = Object.values(state.increments).reduce(
    (sum, val) => sum + val,
    0,
  );
  const decSum = Object.values(state.decrements).reduce(
    (sum, val) => sum + val,
    0,
  );
  return incSum - decSum;
}

// Refresh the user interface state cards
function updateCrdtUI() {
  nodeAValEl.textContent = getLocalValue(nodeAState).toString();
  nodeAStateEl.textContent = JSON.stringify(nodeAState, null, 2);

  nodeBValEl.textContent = getLocalValue(nodeBState).toString();
  nodeBStateEl.textContent = JSON.stringify(nodeBState, null, 2);
}

// Assign Register Manipulations
nodeAIncBtn.addEventListener("click", () => {
  nodeAState.increments["A"] = (nodeAState.increments["A"] || 0) + 1;
  updateCrdtUI();
});
nodeADecBtn.addEventListener("click", () => {
  nodeAState.decrements["A"] = (nodeAState.decrements["A"] || 0) + 1;
  updateCrdtUI();
});

nodeBIncBtn.addEventListener("click", () => {
  nodeBState.increments["B"] = (nodeBState.increments["B"] || 0) + 1;
  updateCrdtUI();
});
nodeBDecBtn.addEventListener("click", () => {
  nodeBState.decrements["B"] = (nodeBState.decrements["B"] || 0) + 1;
  updateCrdtUI();
});

// The Commutative, Associative, and Idempotent CRDT Merge Action
syncCrdtBtn.addEventListener("click", () => {
  const nodes = ["A", "B"];
  const unifiedIncrements: Record<string, number> = {};
  const unifiedDecrements: Record<string, number> = {};

  // Take the maximum observed history vector for every node key
  nodes.forEach((node) => {
    unifiedIncrements[node] = Math.max(
      nodeAState.increments[node] || 0,
      nodeBState.increments[node] || 0,
    );
    unifiedDecrements[node] = Math.max(
      nodeAState.decrements[node] || 0,
      nodeBState.decrements[node] || 0,
    );
  });

  // Replicate states completely across the cluster network topology
  nodeAState = {
    increments: { ...unifiedIncrements },
    decrements: { ...unifiedDecrements },
  };
  nodeBState = {
    increments: { ...unifiedIncrements },
    decrements: { ...unifiedDecrements },
  };

  // Render converged values
  updateCrdtUI();
  globalCrdtValEl.textContent = getLocalValue(nodeAState).toString();
});

// Initial Render invocation
updateCrdtUI();
