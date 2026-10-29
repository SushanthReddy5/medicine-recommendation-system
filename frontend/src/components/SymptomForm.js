import React, { useState } from "react";

function SymptomForm() {

  const [symptom, setSymptom] = useState("");

  const handleSubmit = () => {
    alert("Searching medicine for: " + symptom);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>

      <h3>Enter Symptoms</h3>

      <input
        type="text"
        placeholder="Example: fever, headache"
        value={symptom}
        onChange={(e) => setSymptom(e.target.value)}
        style={{ padding: "10px", width: "300px" }}
      />

      <br/><br/>

      <button
        onClick={handleSubmit}
        style={{
          padding: "10px 20px",
          backgroundColor: "#1976d2",
          color: "white",
          border: "none"
        }}
      >
        Get Recommendation
      </button>

    </div>
  );
}

export default SymptomForm;