// components/NavigationTabs.tsx

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
    <div className="bg-white border-b w-full">
      <div className="max-w-4xl mx-auto px-2 sm:px-4">

        {/* Horizontal Scroll Wrapper */}
        <div
          className="
            flex 
            gap-6 
            overflow-x-auto 
            whitespace-nowrap 
            scrollbar-hide 
            no-scrollbar 
            pt-3 pb-2
            justify-start
            sm:justify-start
            md:justify-center   /* Desktop me tabs center align honge */
          "
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.name;

            return (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`
                  relative 
                  pb-2 
                  text-sm 
                  font-semibold 
                  transition-all 
                  whitespace-nowrap 
                  px-1
                  ${isActive ? "text-red-600" : "text-gray-500 hover:text-gray-700"}
                `}
              >
                {tab.name} {tab.count ? `(${tab.count})` : ""}

                {/* underline indicator */}
                <span
                  className={`
                    absolute 
                    left-0 
                    bottom-0 
                    h-[2px] 
                    w-full 
                    transition-all 
                    duration-300
                    ${isActive ? "bg-red-600 scale-100" : "scale-0 bg-transparent"}
                  `}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* SCROLLBAR HIDE for ALL BROWSERS */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
