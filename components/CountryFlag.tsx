interface CountryFlagProps {
  countryCode: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function CountryFlag({ countryCode, size = 'md', className = '' }: CountryFlagProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-7xl'
  }

  const flagIconSizes = {
    sm: 'w-6 h-4',
    md: 'w-8 h-6',
    lg: 'w-12 h-9',
    xl: 'w-16 h-12'
  }

  return (
    <span className={`fi fi-${countryCode.toLowerCase()} ${flagIconSizes[size]} inline-block ${className}`} />
  )
}
