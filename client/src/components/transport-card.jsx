import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';

export default function TransportCard({
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
  onToCityClick,
  onInCityClick,
  onNavigationClick,
  onCompleteNavigationClick,
  onTestingClick
}) {
  const { t } = useLanguage();
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
        <p className="text-center font-devanagari font-semibold mb-3" style={{ color: iconBg.replace('bg-', '#') }} data-testid={`text-${testId}-hindi`}>
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

      {/* Hover Overlay with Transport Options */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center p-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-center mb-2">
          <h3 className="text-lg font-bold text-kumbh-text mb-1" data-testid={`text-${testId}-hover-title`}>
            Choose Transport Type
          </h3>
          <p className="font-devanagari text-sm text-kumbh-orange font-semibold" data-testid={`text-${testId}-hover-hindi`}>
            परिवहन प्रकार चुनें
          </p>
        </div>
        
        <div className="space-y-1.5 w-full max-w-xs">
          <Button
            onClick={onTestingClick}
            className="w-full bg-kumbh-orange text-white hover:bg-kumbh-deep transition-colors py-1.5 text-sm font-semibold"
            data-testid={`button-${testId}-testing`}
          >
            Testing Module
          </Button>

          <Button
            onClick={onCompleteNavigationClick}
            className="w-full bg-purple-600 text-transparent hover:bg-purple-700 transition-colors py-1.5 text-[0px] font-semibold [&>span:not(:first-child)]:hidden"
            data-testid={`button-${testId}-complete-navigation`}
          >
            <span className="block text-base text-white">Complete Navigation</span>
            🚗 To the City
            <span className="block text-xs font-devanagari">शहर तक</span>
          </Button>
          
          <Button
            onClick={onToCityClick}
            className="w-full bg-kumbh-orange text-transparent hover:bg-kumbh-deep transition-colors py-1.5 text-[0px] font-semibold [&>span:not(:first-child)]:hidden"
            data-testid={`button-${testId}-to-city`}
          >
            <span className="block text-base text-white">Transport to the City</span>
            🚌 In the City
            <span className="block text-xs font-devanagari">शहर में</span>
          </Button>
          
          <Button
            onClick={onInCityClick}
            className="w-full bg-blue-600 text-transparent hover:bg-blue-700 transition-colors py-1.5 text-[0px] font-semibold [&>span:not(:first-child)]:hidden"
            data-testid={`button-${testId}-in-city`}
          >
            <span className="block text-base text-white">Transport in the City</span>
            🗺️ Navigation
            <span className="block text-xs font-devanagari">नेविगेशन</span>
          </Button>

          <Button
            onClick={onNavigationClick}
            className="w-full bg-green-600 text-transparent hover:bg-green-700 transition-colors py-1.5 text-[0px] font-semibold [&>span:not(:first-child)]:hidden"
            data-testid={`button-${testId}-navigation`}
          >
            <span className="block text-base text-white">Navigation</span>
            🧭 Complete Navigation
            <span className="block text-xs font-devanagari">पूर्ण नेविगेशन</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
