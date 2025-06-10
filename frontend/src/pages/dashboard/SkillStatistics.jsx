import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useState } from 'react';

export default function SkillsStatisticsPage() {
  const [progSkills, setProgSkills] = useState([]);
  const [prodKnowledge, setProdKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
   fetch('http://localhost:5000/api/statistics')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch statistics data');
        return res.json();
      })
      .then((data) => {
        // Convert backend format to match Recharts keys
        const formattedProg = data.programming_skills.map((item) => ({
          skill: item.name,
          count: item.worker_count,
        }));
        const formattedProd = data.product_knowledge.map((item) => ({
          product: item.name,
          count: item.worker_count,
        }));

        setProgSkills(formattedProg);
        setProdKnowledge(formattedProd);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-6">Loading skill and product knowledge statistics...</p>;
  if (error) return <p className="p-6 text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-4">Programming Skills Statistics</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={progSkills}>
            <XAxis dataKey="skill" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Number of Workers" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Product Knowledge Statistics</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={prodKnowledge}>
            <XAxis dataKey="product" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#10b981" name="Number of Workers" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
