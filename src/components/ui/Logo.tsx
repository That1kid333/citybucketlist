import { useNavigate } from 'react-router-dom';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className = '', size = 'md' }: LogoProps) {
  const navigate = useNavigate();

  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10'
  };

  const handleClick = () => {
    navigate('/');
  };

  return (
    <img
      src="https://aiautomationsstorage.blob.core.windows.net/cbl/citybucketlist%20logo.png"
      alt="CityBucketList.com"
      className={`cursor-pointer ${sizeClasses[size]} ${className}`}
      onClick={handleClick}
    />
  );
}
