import { useState } from 'react';
import { Button } from '@/components/ui/button';

export default function StayCard({
  title,
  titleHindi,
  description,
  icon,
  badge,
  gradientFrom,
  gradientTo,
  borderColor,
  iconBg,
  badgeColor,
  testId,
  onHotelsClick
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`service-card bg-gradient-to-br ${gradientFrom} ${gradientTo} p-6 rounded-2xl shadow-lg border-2 ${borderColor} cursor-pointer relative overflow-hidden transition-all duration-300`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={testId}
    >
      {/* Main Card Content */}
      <div className={`transition-opacity duration-300 ${isHovered ? 'opacity-0' : 'opacity-100'}`}>
        <div className={`${iconBg} text-white p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold text-center mb-2" data-testid={`text-${testId}-title`}>
          {title}
        </h3>
        <p className="text-center font-devanagari font-semibold mb-3 text-kumbh-orange" data-testid={`text-${testId}-hindi`}>
          {titleHindi}
        </p>
        <p className="text-gray-700 text-center text-sm" data-testid={`text-${testId}-description`}>
          {description}
        </p>
        <div className="mt-4 text-center">
          <span className={`${badgeColor} text-white text-xs px-2 py-1 rounded-full`} data-testid={`badge-${testId}`}>
            {badge}
          </span>
        </div>
      </div>

      {/* Hover Overlay with Stay Options */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center mb-4">
          <h3 className="text-xl font-bold text-kumbh-text mb-2" data-testid={`text-${testId}-hover-title`}>
            Choose Stay Type
          </h3>
          <p className="font-devanagari text-kumbh-orange font-semibold" data-testid={`text-${testId}-hover-hindi`}>
            आवास प्रकार चुनें
          </p>
        </div>

        <div className="space-y-2 w-full max-w-xs">
          <Button
            onClick={onHotelsClick}
            className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep transition-colors py-2 text-base font-semibold"
            data-testid={`button-${testId}-hotels`}
          >
            🏨 Hotels
            <span className="block text-xs font-devanagari">होटल</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
