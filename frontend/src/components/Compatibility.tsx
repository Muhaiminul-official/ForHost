import { Droplet, Check, X } from 'lucide-react';

export default function Compatibility() {
  const bloodTypes = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];
  
  // Matrix of compatibility: donor (row) -> recipient (col)
  // true = compatible, false = incompatible
  const compatibilityMatrix = [
    [true, true, true, true, true, true, true, true],       // O-
    [false, true, false, true, false, true, false, true],   // O+
    [false, false, true, true, false, false, true, true],   // A-
    [false, false, false, true, false, false, false, true], // A+
    [false, false, false, false, true, true, true, true],   // B-
    [false, false, false, false, false, true, false, true], // B+
    [false, false, false, false, false, false, true, true], // AB-
    [false, false, false, false, false, false, false, true] // AB+
  ];

  return (
    <section className="py-20 bg-gray-50 dark:bg-[#0a0a0a] border-t border-gray-200 dark:border-white/5">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Blood Type Compatibility</h2>
          <p className="text-gray-600 dark:text-gray-400">Understanding which blood types are compatible can save lives.</p>
        </div>

        <div className="bg-white dark:bg-[#111111] border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <Droplet className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Blood Compatibility Chart</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Who can donate to whom</p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-600 dark:text-gray-400 uppercase bg-gray-50 dark:bg-[#161616] border-b border-gray-200 dark:border-white/5">
                <tr>
                  <th className="px-6 py-4 font-medium">Donor ↓ / Recipient →</th>
                  {bloodTypes.map(type => (
                    <th key={type} className="px-4 py-4 font-bold text-center text-gray-900 dark:text-white">{type}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bloodTypes.map((donorType, rowIndex) => (
                  <tr key={donorType} className="border-b border-gray-200 dark:border-white/5 last:border-0 hover:bg-black/[0.02] dark:bg-white/[0.02]">
                    <td className="px-6 py-4 font-bold text-red-500">{donorType}</td>
                    {bloodTypes.map((_, colIndex) => {
                      const isCompatible = compatibilityMatrix[rowIndex][colIndex];
                      return (
                        <td key={colIndex} className="px-4 py-4 text-center">
                          <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${isCompatible ? 'bg-red-500/20 text-red-500' : 'bg-black/5 dark:bg-white/5 text-gray-600'}`}>
                            {isCompatible ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
