import { useEffect, useState } from "react";
import { fetchDashboardData } from "../api/fakeApi";
import Loader from "../components/Loader";

export default function Dashboard() {
  const [stats, setStats] = useState<number[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData()
      .then((res) => {
        setStats(res.stats);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      });
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!stats) return <Loader />;

  return (
    <div>
      <h2>Dashboard</h2>
      <ul>
        {stats.map((s, i) => (
          <li key={i}>Stat: {s}</li>
        ))}
      </ul>
      <button>Refresh Dashboard</button>
    </div>
  );
}
