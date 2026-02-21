import React from 'react';
import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface CategoryCardProps {
  name: string;
  count: number;
  icon: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({ name, count, icon }) => {
  // Get the icon component from lucide-react
  // Convert icon name from kebab-case to PascalCase
  const getIconComponent = (iconName: string): LucideIcon => {
    const iconKey = iconName
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    const IconComponent = (Icons as any)[iconKey];
    return IconComponent || Icons.Briefcase;
  };

  const Icon = getIconComponent(icon);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center gap-4">
        <div className="bg-blue-100 text-blue-600 p-3 rounded-lg">
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <p className="text-sm text-gray-600">
            {count} {count === 1 ? 'position' : 'positions'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CategoryCard;
