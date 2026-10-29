import DrugInteractionChecker from "../components/DrugInteractionChecker";

export default function DrugInteractionsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          💊 Drug Interaction Checker
        </h2>
        <p className="text-slate-400">
          Check if your medicines are safe to take together
        </p>
      </div>
      <DrugInteractionChecker />
    </div>
  );
}
