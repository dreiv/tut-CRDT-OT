# tut-CRDT-OT: Distributed Systems Laboratory

Welcome to **tut-CRDT-OT**, a frontend training playground built to explore, simulate, and contrast the two primary paradigms of distributed consistency and collaborative state management: **Operational Transformation (OT)** and **Conflict-free Replicated Data Types (CRDTs)**.

---

## 🔬 Core Concepts & Architecture

### 1. Operational Transformation (OT)

Operational Transformation relies on capturing human intentions as discrete sequential mathematical edits (operations) and transforming their coordinate indexes relative to other concurrent changes.

* **How it Works (The "Three-Step" Flow):**
1. **Generate:** A user makes a change (e.g., "Insert 'x' at index 5").
2. **Transform:** If another user concurrently inserted a letter at index 2, the server intercepts the first operation and dynamically modifies its index to compensate for the shifted string length ("Insert 'x' at index 6").
3. **Apply:** The adjusted operation executes globally.


* **Where it is Used:** Google Docs, Notion, Microsoft Office Online, and Etherpad.
* **In this Project:** Demonstrated via text reconciliation where independent edits are analyzed against a common source string, evaluated into discrete mathematical patches using `diff-match-patch`, and integrated concurrently.

### 2. Conflict-free Replicated Data Types (CRDT)

CRDTs achieve consensus without a centralized chronological coordinator. Instead of exchanging operations, nodes exchange state variables wrapped in strict mathematical boundaries where conflicts are structurally impossible.

* **The Three Mathematical Axioms:**
* **Commutative ($A + B = B + A$):** The network delivery order does not matter.
* **Associative ($(A + B) + C = A + (B + C)$):** Message grouping or batching does not change the result.
* **Idempotent ($A + A = A$):** Network retry packet duplication is harmlessly absorbed.


* **Where it is Used:** Figma, Linear, Apple Notes, Redis CRDTs, and decentralized peer-to-peer apps.
* **In this Project:** Demonstrated using a **PN-Counter (Positive-Negative Counter)** ledger. Each node keeps an independent vector matrix mapping increments and decrements per node. Syncing simply uses a `Math.max()` matrix blend across the network fabric.

---

## ⚡ Interaction with Optimistic Updates

An **Optimistic Update** is a frontend UI pattern where an application assumes a network call will succeed and renders the updated state immediately, rather than forcing the user to wait for a spinning wheel while a server processes the transaction.

While optimistic updates provide instant visual feedback, handling conflicts when the background synchronization fails or returns mismatched data is a significant architectural challenge. Here is how OT and CRDTs handle this dynamic:

| Dimension | OT + Optimistic Updates | CRDT + Optimistic Updates |
| --- | --- | --- |
| **Local State Mutation** | Mutates state instantly in the view layer while preserving a copy of the pending operation. | Mutates state instantly by appending the state change locally directly into the CRDT data structure. |
| **The Synchronization Hook** | Requires an active network socket connection to a central authority server to obtain structural timeline positioning. | Can buffer state mutations completely offline. Synchronization data payloads can be distributed over any medium (WebSocket, WebRTC, Bluetooth). |
| **Conflict Resolution Mechanics** | **Rollback & Rebase:** If the server returns an operation that contradicts or precedes the user's local optimistic execution, the client must roll back the text layer, transform the new remote inputs, and re-apply its local changes on top. | **Native Convergence:** No rollbacks or server coordinates are needed. The remote state is fed into the local CRDT engine. The mathematical properties (`Math.max` vectors, LWW clocks, etc.) blend the two histories instantly. |
| **Complexity Profile** | Medium/High client-side complexity due to history tracking buffer states and state timeline rollbacks. | Low client-side UI overhead. The CRDT data type natively manages tracking history inside the object lifecycle. |

---

### Getting Started

1. Clone the repository and navigate to the project root:
```bash
git clone https://github.com/dreiv/tut-CRDT-OT.git
cd tut-CRDT-OT

```


2. Install all dependencies across all sub-workspaces simultaneously:
```bash
npm install

```


3. Boot up the frontend application local development server:
```bash
npm run dev

```
