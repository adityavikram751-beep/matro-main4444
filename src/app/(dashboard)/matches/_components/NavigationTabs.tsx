//  components/NavigationTabs.tsx
interface Tab {
  name: string
  count?: number | null
}

interface NavigationTabsProps {
  activeTab: string
  setActiveTab: (tab: string) => void
  tabs: Tab[]
}

export default function NavigationTabs({ activeTab, setActiveTab, tabs }: NavigationTabsProps) {
  return (
    <div className="bg-white border-b">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`py-4 px-2 whitespace-nowrap text-sm font-medium border-b-2 transition-colors font-Lato ${
                activeTab === tab.name
                  ? "border-red-500 text-red-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.name}
              {tab.count && `(${tab.count})`}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}