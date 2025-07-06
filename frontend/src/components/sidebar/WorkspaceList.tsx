import React, { useState } from 'react';
import Icon from '../ui/Icon';

const pages = [
  { icon: 'Home', label: 'Home' },
  { icon: 'BarChart2', label: 'Analytics' },
];

// Fun accent colors for icons
const accentColors = [
  'text-pink-500',
  'text-blue-500',
  'text-green-500',
  'text-yellow-500',
  'text-purple-500',
  'text-orange-500',
  'text-red-500',
  'text-cyan-500',
  'text-fuchsia-500',
  'text-emerald-500',
  'text-indigo-500',
  'text-lime-500',
  'text-rose-500',
  'text-sky-500',
  'text-teal-500',
  'text-violet-500',
];

const privatePages = [
  {
    icon: 'Sigma',
    label: 'Algebra',
    color: accentColors[0],
    subpages: [
      { icon: 'FunctionSquare', label: 'Quadratic Equations', color: accentColors[1] },
      { icon: 'Divide', label: 'Linear Systems', color: accentColors[2] },
      { icon: 'Equal', label: 'Inequalities', color: accentColors[3] },
    ],
  },
  {
    icon: 'Triangle',
    label: 'Geometry',
    color: accentColors[4],
    subpages: [
      { icon: 'Circle', label: 'Circles', color: accentColors[5] },
      { icon: 'Square', label: 'Polygons', color: accentColors[6] },
      { icon: 'Ruler', label: 'Triangles', color: accentColors[7] },
    ],
  },
  {
    icon: 'Infinity',
    label: 'Calculus',
    color: accentColors[8],
    subpages: [
      { icon: 'BarChart', label: 'Derivatives', color: accentColors[9] },
      { icon: 'AreaChart', label: 'Integrals', color: accentColors[10] },
      { icon: 'TrendingUp', label: 'Limits', color: accentColors[11] },
    ],
  },
  {
    icon: 'Layers',
    label: 'Combinatorics',
    color: accentColors[12],
    subpages: [
      { icon: 'List', label: 'Permutations', color: accentColors[13] },
      { icon: 'ListOrdered', label: 'Combinations', color: accentColors[14] },
      { icon: 'Shuffle', label: 'Pigeonhole Principle', color: accentColors[15] },
    ],
  },
];

const WorkspaceList: React.FC = () => {
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const handleToggleExpand = (label: string) => {
    setExpandedItems((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <div className="px-4 mt-2">
      {/* Main Links */}
      <div className="flex flex-col gap-1 mb-4">
        {pages.map((page) => (
          <button
            key={page.label}
            className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-neutral-700 transition hover:bg-neutral-200"
          >
            <Icon iconName={page.icon as any} size={16} />
            <span>{page.label}</span>
          </button>
        ))}
      </div>
      {/* Section Header */}
      <div className="flex items-center justify-between uppercase text-xs font-semibold text-neutral-500 mb-4 mt-4 px-2 tracking-wider bg-blue-100 py-1.5 rounded">
        <span>Private</span>
        <div className="flex items-center gap-1">
          <button className="p-0.5 rounded hover:bg-neutral-300 transition-colors">
            <Icon iconName={'FilePlus' as any} size={16} className="text-neutral-600" />
          </button>
          <button className="p-0.5 rounded hover:bg-neutral-300 transition-colors">
            <Icon iconName={'FolderPlus' as any} size={16} className="text-neutral-600" />
          </button>
        </div>
      </div>
      {/* Math Directories */}
      <div className="flex flex-col gap-1">
        {privatePages.map((page) => (
          <React.Fragment key={page.label}>
            <div
              className={`flex items-center justify-between w-full rounded-md transition border ${
                selectedItem === page.label
                  ? 'border-blue-500 bg-neutral-100'
                  : 'border-transparent'
              } hover:bg-neutral-200`}
            >
              <div
                onClick={() => setSelectedItem(page.label)}
                className="flex-grow flex items-center gap-2 px-2 py-1.5 text-sm text-neutral-700 cursor-pointer"
              >
                <Icon iconName={page.icon as any} size={16} className={page.color} />
                <span>{page.label}</span>
              </div>
              <button
                onClick={() => handleToggleExpand(page.label)}
                className="p-1 mr-1 rounded hover:bg-neutral-300"
              >
                <Icon
                  iconName={expandedItems[page.label] ? 'ChevronDown' : 'ChevronRight'}
                  size={16}
                  className="text-neutral-500"
                />
              </button>
            </div>
            {/* Subpages */}
            {page.subpages && expandedItems[page.label] && (
              <div className="flex flex-col gap-1 pl-6">
                {page.subpages.map((sub) => (
                  <button
                    key={sub.label}
                    onClick={() => setSelectedItem(sub.label)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-neutral-500 transition hover:bg-neutral-200 border ${
                      selectedItem === sub.label
                        ? 'border-blue-500 bg-neutral-100'
                        : 'border-transparent'
                    }`}
                  >
                    <Icon iconName={sub.icon as any} size={14} className={sub.color} />
                    <span>{sub.label}</span>
                  </button>
                ))}
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default WorkspaceList;