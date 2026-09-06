import { DisposalNavigator } from "./disposal-navigator";

export default function Home() {
  return (
    <main className="page-shell">
      <header className="page-header">
        <p className="eyebrow">Oʻahu residential household disposal</p>
        <h1>Find out how to dispose of a household item</h1>
        <p className="summary">
          Describe one item to get a reviewed disposal option from official government
          guidance.
        </p>
      </header>

      <DisposalNavigator />

      <aside className="trust-note" aria-labelledby="trust-heading">
        <h2 id="trust-heading">How this guidance works</h2>
        <p>
          Official sources define disposal rules. This version uses deterministic
          matching. If AI is used later, it may only help interpret the item—it cannot
          create or change guidance.
        </p>
      </aside>
    </main>
  );
}
