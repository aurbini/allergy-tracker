// Information component about supported pollen types
export default function PollenTypeInfo() {
  const supportedPollenTypes = [
    {
      name: 'Alder Pollen',
      category: 'Tree',
      description: 'Common in early spring',
    },
    {
      name: 'Birch Pollen',
      category: 'Tree',
      description: 'High allergen, spring season',
    },
    {
      name: 'Olive Pollen',
      category: 'Tree',
      description: 'Mediterranean regions',
    },
    {
      name: 'Grass Pollen',
      category: 'Grass',
      description: 'Late spring to summer',
    },
    {
      name: 'Ragweed Pollen',
      category: 'Weed',
      description: 'Late summer to fall',
    },
    {
      name: 'Mugwort Pollen',
      category: 'Weed',
      description: 'Late summer to fall',
    },
  ]

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <h3 className="font-semibold text-green-800 mb-3">
        Supported Pollen Types
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {supportedPollenTypes.map((pollen) => (
          <div key={pollen.name} className="flex items-center justify-between">
            <div>
              <span className="font-medium text-green-900">{pollen.name}</span>
              <span className="text-sm text-green-600 ml-2">
                ({pollen.category})
              </span>
            </div>
            <span className="text-xs text-green-600">{pollen.description}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-green-700 mt-3">
        These pollen types have real-time data available for accurate allergy
        tracking.
      </p>
    </div>
  )
}
