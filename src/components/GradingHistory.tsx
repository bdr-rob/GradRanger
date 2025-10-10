import React, { useState } from 'react';

export default function GradingHistory() {
  const [selectedCompany, setSelectedCompany] = useState('All');

  const gradingData = [
    { company: 'PSA', cert: '82345678', player: 'Mike Trout', year: 2011, grade: 10, population: 245, date: '2025-09-15' },
    { company: 'BGS', cert: 'BGS-9876', player: 'LeBron James', year: 2003, grade: 9.5, population: 156, date: '2025-09-10' },
    { company: 'PSA', cert: '82345679', player: 'Tom Brady', year: 2000, grade: 9, population: 1823, date: '2025-09-05' },
    { company: 'CGC', cert: 'CGC-4567', player: 'Patrick Mahomes', year: 2017, grade: 9, population: 432, date: '2025-08-28' },
    { company: 'PSA', cert: '82345680', player: 'Shohei Ohtani', year: 2018, grade: 10, population: 89, date: '2025-08-20' }
  ];

  const filteredData = selectedCompany === 'All' 
    ? gradingData 
    : gradingData.filter(d => d.company === selectedCompany);

  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-[#14314F] mb-6">Grading History</h2>

      <div className="flex gap-2 mb-6">
        {['All', 'PSA', 'BGS', 'CGC'].map(company => (
          <button
            key={company}
            onClick={() => setSelectedCompany(company)}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              selectedCompany === company 
                ? 'bg-[#47682d] text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {company}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#14314F] text-white">
            <tr>
              <th className="px-4 py-3 text-left">Company</th>
              <th className="px-4 py-3 text-left">Cert #</th>
              <th className="px-4 py-3 text-left">Player</th>
              <th className="px-4 py-3 text-left">Year</th>
              <th className="px-4 py-3 text-center">Grade</th>
              <th className="px-4 py-3 text-center">Population</th>
              <th className="px-4 py-3 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, i) => (
              <tr key={i} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">
                  <span className="font-semibold text-[#47682d]">{item.company}</span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{item.cert}</td>
                <td className="px-4 py-3 font-semibold">{item.player}</td>
                <td className="px-4 py-3">{item.year}</td>
                <td className="px-4 py-3 text-center">
                  <span className="bg-[#47682d] text-white px-3 py-1 rounded-full font-bold">
                    {item.grade}
                  </span>
                </td>
                <td className="px-4 py-3 text-center text-gray-600">{item.population}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid md:grid-cols-3 gap-4">
        <div className="bg-[#14314F] text-white p-4 rounded-lg">
          <h3 className="text-sm text-[#ABD2BE] mb-1">Total Graded</h3>
          <p className="text-2xl font-bold">{filteredData.length}</p>
        </div>
        <div className="bg-[#47682d] text-white p-4 rounded-lg">
          <h3 className="text-sm text-[#ABD2BE] mb-1">Avg Grade</h3>
          <p className="text-2xl font-bold">
            {(filteredData.reduce((sum, d) => sum + d.grade, 0) / filteredData.length).toFixed(1)}
          </p>
        </div>
        <div className="bg-[#14314F] text-white p-4 rounded-lg">
          <h3 className="text-sm text-[#ABD2BE] mb-1">Gem Mint (10s)</h3>
          <p className="text-2xl font-bold">{filteredData.filter(d => d.grade === 10).length}</p>
        </div>
      </div>
    </div>
  );
}
