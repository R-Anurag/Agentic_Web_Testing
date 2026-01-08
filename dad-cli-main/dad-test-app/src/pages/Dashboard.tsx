import { useEffect, useState } from "react";
import { fetchDashboardData } from "../api/fakeApi";
import Loader from "../components/Loader";

export default function Dashboard() {
  const [stats, setStats] = useState<number[] | null>(null);

  useEffect(() => {
    fetchDashboardData().then((res) => {
      setStats(res.stats);
    });
  }, []);

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
