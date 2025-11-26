import React from 'react';

interface SVGIconProps {
  size?: number;
  color?: string;
  className?: string;
}

// 简洁的小狗图标
export const DogIcon: React.FC<SVGIconProps> = ({ size = 24, color = '#8B4513', className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="30" fill={color} opacity="0.8"/>
    <ellipse cx="35" cy="40" rx="8" ry="12" fill={color}/>
    <ellipse cx="65" cy="40" rx="8" ry="12" fill={color}/>
    <circle cx="45" cy="48" r="2" fill="white"/>
    <circle cx="55" cy="48" r="2" fill="white"/>
    <ellipse cx="50" cy="55" rx="1.5" ry="2" fill="black"/>
    <path d="M 45 62 Q 50 65 55 62" stroke="black" strokeWidth="1.5" fill="none"/>
  </svg>
);

// 简洁的天平图标
export const ScaleIcon: React.FC<SVGIconProps> = ({ size = 24, color = '#8B4513', className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <line x1="50" y1="20" x2="50" y2="75" stroke={color} strokeWidth="3"/>
    <line x1="25" y1="35" x2="75" y2="35" stroke={color} strokeWidth="2"/>
    <circle cx="35" cy="45" r="10" fill="none" stroke={color} strokeWidth="2"/>
    <circle cx="65" cy="45" r="10" fill="none" stroke={color} strokeWidth="2"/>
    <rect x="47" y="75" width="6" height="8" fill={color}/>
  </svg>
);

// 优化的锤子图标 - 法院专用
export const HammerIcon: React.FC<SVGIconProps> = ({ size = 24, color = '#8B4513', className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    {/* 锤头主体 */}
    <rect x="15" y="25" width="30" height="16" rx="8" fill={color}/>
    {/* 锤头侧面立体效果 */}
    <rect x="15" y="32" width="30" height="4" rx="2" fill="#654321" opacity="0.8"/>
    {/* 锤头顶部高光 */}
    <rect x="18" y="27" width="24" height="2" rx="1" fill="#D2691E" opacity="0.6"/>

    {/* 锤柄 */}
    <rect x="45" y="20" width="8" height="60" rx="4" fill="#8B4513"/>
    {/* 锤柄纹理 */}
    <line x1="47" y1="25" x2="47" y2="75" stroke="#654321" strokeWidth="1" opacity="0.6"/>
    <line x1="51" y1="25" x2="51" y2="75" stroke="#A0522D" strokeWidth="1" opacity="0.4"/>

    {/* 锤柄底部握把 */}
    <ellipse cx="49" cy="75" rx="6" ry="3" fill="#654321"/>

    {/* 连接部分 */}
    <rect x="42" y="30" width="14" height="8" rx="4" fill="#654321"/>

    {/* 装饰性法庭徽章 */}
    <circle cx="30" cy="33" r="3" fill="#D4A574" opacity="0.8"/>
    <circle cx="30" cy="33" r="1.5" fill="#8B4513"/>

    {/* 动态效果线条 */}
    <path d="M 60 15 Q 65 18 62 22" stroke={color} strokeWidth="2" opacity="0.6" strokeLinecap="round"/>
    <path d="M 65 10 Q 70 13 67 17" stroke={color} strokeWidth="2" opacity="0.4" strokeLinecap="round"/>
    <path d="M 70 5 Q 75 8 72 12" stroke={color} strokeWidth="2" opacity="0.3" strokeLinecap="round"/>
  </svg>
);

// 简洁的心形图标
export const HeartIcon: React.FC<SVGIconProps> = ({ size = 24, color = '#E8B4A0', className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path
      d="M50,80 C30,60 15,45 15,30 C15,20 25,10 35,10 C42,10 47,15 50,20 C53,15 58,10 65,10 C75,10 85,20 85,30 C85,45 70,60 50,80 Z"
      fill={color}
    />
  </svg>
);

// 简洁的灯泡图标
export const LightBulbIcon: React.FC<SVGIconProps> = ({ size = 24, color = '#FFD700', className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="40" r="18" fill={color}/>
    <rect x="45" y="58" width="10" height="12" rx="2" fill={color} opacity="0.8"/>
    <rect x="42" y="70" width="16" height="2" rx="1" fill={color}/>
    <rect x="42" y="75" width="16" height="2" rx="1" fill={color}/>
  </svg>
);

// 简洁的搜索图标
export const SearchIcon: React.FC<SVGIconProps> = ({ size = 24, color = '#8B4513', className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="40" cy="40" r="22" fill="none" stroke={color} strokeWidth="4"/>
    <line x1="58" y1="58" x2="80" y2="80" stroke={color} strokeWidth="4" strokeLinecap="round"/>
  </svg>
);

// 简洁的用户图标（替代丑的男女图标）
export const UserIcon: React.FC<SVGIconProps> = ({ size = 24, color = '#8B4513', className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="35" r="18" fill={color} opacity="0.7"/>
    <path d="M 20 85 Q 20 65 50 65 Q 80 65 80 85" fill={color} opacity="0.7"/>
  </svg>
);

// 优化的男性图标 - 简洁现代风格
export const MaleIcon: React.FC<SVGIconProps> = ({ size = 24, color = '#4A90E2', className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    {/* 头部 */}
    <circle cx="50" cy="30" r="16" fill={color} opacity="0.9"/>
    {/* 身体 */}
    <path d="M 30 85 Q 30 60 50 60 Q 70 60 70 85" fill={color} opacity="0.8"/>
    {/* 男性符号装饰 */}
    <circle cx="72" cy="18" r="3" fill="none" stroke={color} strokeWidth="2"/>
    <line x1="72" y1="15" x2="72" y2="10" stroke={color} strokeWidth="2"/>
    <line x1="70" y1="12" x2="74" y2="12" stroke={color} strokeWidth="2"/>
    <line x1="75" y1="21" x2="80" y2="16" stroke={color} strokeWidth="2"/>
    <line x1="78" y1="16" x2="80" y2="16" stroke={color} strokeWidth="2"/>
    <line x1="80" y1="16" x2="80" y2="18" stroke={color} strokeWidth="2"/>
  </svg>
);

// 优化的女性图标 - 简洁现代风格
export const FemaleIcon: React.FC<SVGIconProps> = ({ size = 24, color = '#E8B4A0', className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    {/* 头部 */}
    <circle cx="50" cy="30" r="16" fill={color} opacity="0.9"/>
    {/* 长发轮廓 */}
    <path
      d="M 34 22 Q 30 18 32 26 Q 34 14 40 20 Q 45 12 50 18 Q 55 12 60 20 Q 66 14 68 26 Q 70 18 66 22 Q 68 28 66 32 Q 64 28 62 30 Q 60 25 58 28 Q 56 22 54 26 Q 52 20 50 24 Q 48 20 46 26 Q 44 22 42 28 Q 40 25 38 30 Q 36 28 34 32 Q 32 28 34 22"
      fill={color}
      opacity="0.6"
    />
    {/* 身体 */}
    <path d="M 30 85 Q 30 60 50 60 Q 70 60 70 85" fill={color} opacity="0.8"/>
    {/* 女性符号装饰 */}
    <circle cx="72" cy="20" r="4" fill="none" stroke={color} strokeWidth="2"/>
    <line x1="72" y1="24" x2="72" y2="32" stroke={color} strokeWidth="2"/>
    <line x1="68" y1="28" x2="76" y2="28" stroke={color} strokeWidth="2"/>
    {/* 小花装饰 */}
    <circle cx="25" cy="35" r="1.5" fill={color} opacity="0.7"/>
    <circle cx="75" cy="40" r="1.5" fill={color} opacity="0.7"/>
  </svg>
);

// 简洁的星星图标
export const StarIcon: React.FC<SVGIconProps> = ({ size = 24, color = '#FFD700', className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path
      d="M50,15 L58,40 L85,40 L65,57 L73,82 L50,65 L27,82 L35,57 L15,40 L42,40 Z"
      fill={color}
    />
  </svg>
);

// 简洁的消息图标
export const MessageIcon: React.FC<SVGIconProps> = ({ size = 24, color = '#8B4513', className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <rect x="15" y="25" width="70" height="45" rx="8" fill={color} opacity="0.8"/>
    <path d="M 15 25 L 50 50 L 85 25" stroke="white" strokeWidth="2" fill="none"/>
  </svg>
);

// 简洁的时钟图标
export const ClockIcon: React.FC<SVGIconProps> = ({ size = 24, color = '#8B4513', className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <circle cx="50" cy="50" r="30" fill="none" stroke={color} strokeWidth="4"/>
    <line x1="50" y1="50" x2="50" y2="30" stroke={color} strokeWidth="3"/>
    <line x1="50" y1="50" x2="65" y2="50" stroke={color} strokeWidth="2"/>
    <circle cx="50" cy="50" r="3" fill={color}/>
  </svg>
);

// 简洁的彩虹图标
export const RainbowIcon: React.FC<SVGIconProps> = ({ size = 24, color = '#8B4513', className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path d="M 20 70 A 30 30 0 0 1 80 70" fill="none" stroke="#FF6B6B" strokeWidth="4"/>
    <path d="M 25 70 A 25 25 0 0 1 75 70" fill="none" stroke="#4ECDC4" strokeWidth="4"/>
    <path d="M 30 70 A 20 20 0 0 1 70 70" fill="none" stroke="#45B7D1" strokeWidth="4"/>
  </svg>
);

// 简洁的拥抱图标
export const HugIcon: React.FC<SVGIconProps> = ({ size = 24, color = '#8B4513', className }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className}>
    <path d="M 30 40 Q 50 25 70 40" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round"/>
    <path d="M 30 50 Q 50 35 70 50" stroke={color} strokeWidth="6" fill="none" strokeLinecap="round"/>
    <circle cx="30" cy="30" r="8" fill={color} opacity="0.7"/>
    <circle cx="70" cy="30" r="8" fill={color} opacity="0.7"/>
  </svg>
);

export type { SVGIconProps };