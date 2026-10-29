import HospitalLocator from "../components/HospitalLocator";

export default function HospitalsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          🗺️ Find Nearby Hospitals
        </h2>
        <p className="text-slate-400">
          Locate hospitals, pharmacies and clinics near you
        </p>
      </div>
      <HospitalLocator />
    </div>
  );
}
