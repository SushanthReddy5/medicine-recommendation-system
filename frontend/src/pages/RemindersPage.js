import MedicineReminder from "../components/MedicineReminder";

export default function RemindersPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          ⏰ Medicine Reminders
        </h2>
        <p className="text-slate-400">
          Set up daily reminders and track your medication schedule
        </p>
      </div>
      <MedicineReminder />
    </div>
  );
}
