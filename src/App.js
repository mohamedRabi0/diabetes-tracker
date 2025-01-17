import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto";

function DiabetesTracker() {
  const [time, setTime] = useState("");
  const [glucose, setGlucose] = useState("");
  const [dataPoints, setDataPoints] = useState(
    JSON.parse(localStorage.getItem("diabetesData")) || []
  );
  const [recommendations, setRecommendations] = useState("No data analyzed yet.");

  // Analyze data and generate recommendations
  const analyzeData = () => {
    if (dataPoints.length < 2) {
      setRecommendations("Add more data to analyze trends.");
      return;
    }

    let highCount = 0;
    let lowCount = 0;
    let spikes = 0;

    for (let i = 1; i < dataPoints.length; i++) {
      const prev = dataPoints[i - 1].glucose;
      const current = dataPoints[i].glucose;

      if (current > 180) highCount++;
      if (current < 70) lowCount++;
      if (Math.abs(current - prev) > 50) spikes++;
    }

    let advice = [];
    if (highCount > 0) advice.push(`Detected ${highCount} high glucose readings. Adjust meals or timing.`);
    if (lowCount > 0) advice.push(`Detected ${lowCount} low glucose readings. Ensure enough carbs.`);
    if (spikes > 0) advice.push(`Detected ${spikes} glucose spikes. Monitor potential triggers.`);
    if (advice.length === 0) advice.push("Glucose levels are stable. Keep monitoring.");

    setRecommendations(advice.join(" "));
  };

  // Update localStorage and analyze data whenever dataPoints changes
  useEffect(() => {
    localStorage.setItem("diabetesData", JSON.stringify(dataPoints));
    analyzeData();
  }, [dataPoints]);

  // Add new data point
  const addData = () => {
    if (!time || !glucose || glucose <= 0) {
      alert("Please enter a valid time and glucose level.");
      return;
    }

    const newPoint = { time, glucose: parseFloat(glucose) };
    setDataPoints([...dataPoints, newPoint]);
    setTime("");
    setGlucose("");
  };

  // Chart data and options
  const chartData = {
    labels: dataPoints.map(point => point.time),
    datasets: [
      {
        label: "Glucose Level (mg/dL)",
        data: dataPoints.map(point => point.glucose),
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: { title: { display: true, text: "Time" } },
      y: { title: { display: true, text: "Glucose Level (mg/dL)" }, suggestedMin: 50, suggestedMax: 300 },
    },
  };

  return (
    <div>
      <h1>Diabetes Tracker</h1>

      <div>
        <label>
          Time (HH:MM):
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
          />
        </label>
        <label>
          Glucose Level (mg/dL):
          <input
            type="number"
            value={glucose}
            onChange={e => setGlucose(e.target.value)}
            placeholder="Enter glucose level"
          />
        </label>
        <button onClick={addData}>Add Data</button>
      </div>

      <div>
        <h2>Recorded Data</h2>
        <ul>
          {dataPoints.map((point, index) => (
            <li key={index}>
              Time: {point.time}, Glucose: {point.glucose} mg/dL
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h2>Glucose Chart</h2>
        <Line data={chartData} options={chartOptions} />
      </div>

      <div>
        <h2>Recommendations</h2>
        <p>{recommendations}</p>
      </div>
    </div>
  );
}

export default DiabetesTracker;
