export default function ServiceCard({
  title,
  titleHindi,
  description,
  icon,
  onClick,
  badge,
  gradientFrom,
  gradientTo,
  borderColor,
  iconBg,
  badgeColor,
  testId
}) {
  return (
    <div 
      className={`service-card bg-gradient-to-br ${gradientFrom} ${gradientTo} p-6 rounded-2xl shadow-lg border-2 ${borderColor} cursor-pointer`}
      onClick={onClick}
      data-testid={testId}
    >
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
  );
}

