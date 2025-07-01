import React from 'react';
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
  return (
    <div className="px-2 mt-2">
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
      <div className="uppercase text-[10px] font-semibold text-neutral-500 mb-2 mt-4 px-2 tracking-wider bg-neutral-100 py-1 rounded">
        Private
      </div>
      {/* Math Directories */}
      <div className="flex flex-col gap-1">
        {privatePages.map((page) => (
          <React.Fragment key={page.label}>
            <button
              className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-neutral-700 transition hover:bg-neutral-200`}
            >
              <Icon iconName={page.icon as any} size={16} className={page.color} />
              <span>{page.label}</span>
            </button>
            {/* Subpages */}
            {page.subpages && (
              <div className="flex flex-col gap-1 pl-6">
                {page.subpages.map((sub) => (
                  <button
                    key={sub.label}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs text-neutral-500 transition hover:bg-neutral-200"
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