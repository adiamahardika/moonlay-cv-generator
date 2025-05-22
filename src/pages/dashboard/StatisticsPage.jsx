import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useEffect, useState } from 'react';

const dummyProgrammingSkills = [
  { skill: 'JavaScript', count: 30 },
  { skill: 'Python', count: 25 },
  { skill: 'Java', count: 20 },
  { skill: 'React', count: 15 },
  { skill: 'Golang', count: 10 },
];

const dummyProductKnowledge = [
  { product: 'Microsoft Excel', count: 35 },
  { product: 'PowerPoint', count: 30 },
  { product: 'Figma', count: 25 },
  { product: 'Canva', count: 20 },
  { product: 'CAPCUT', count: 10 },
  { product: 'PHPMyAdmin', count: 15 },
];

export default function SkillsStatisticsPage() {
  const [progSkills, setProgSkills] = useState([]);
  const [prodKnowledge, setProdKnowledge] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulasi fetching data
    setTimeout(() => {
      setProgSkills(dummyProgrammingSkills);
      setProdKnowledge(dummyProductKnowledge);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <p className="p-6">Loading data statistik skill dan pengetahuan produk...</p>;

  return (
    <div className="p-6 space-y-12">
      <div>
        <h2 className="text-2xl font-bold mb-4">Statistik Programming Skill</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={progSkills}>
            <XAxis dataKey="skill" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Jumlah Pekerja" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Statistik Product Knowledge</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={prodKnowledge}>
            <XAxis dataKey="product" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#10b981" name="Jumlah Pekerja" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
