import React from 'react';
import Svg, { Path, Rect, Circle, SvgProps } from 'react-native-svg';

export type IconName =
  | 'wallet'
  | 'briefcase'
  | 'plus'
  | 'shield'
  | 'message'
  | 'scale'
  | 'check'
  | 'checkCircle'
  | 'search'
  | 'chevronRight'
  | 'chevronLeft'
  | 'copy'
  | 'externalLink'
  | 'sparkles'
  | 'bell'
  | 'user'
  | 'clock'
  | 'dollar'
  | 'send'
  | 'lock'
  | 'arrowLeft'
  | 'alertTriangle'
  | 'fileText';

export interface IconProps extends SvgProps {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 20,
  color = '#5B4DFF',
  strokeWidth = 2,
  ...rest
}) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    ...rest,
  };

  switch (name) {
    case 'wallet':
      return (
        <Svg {...commonProps}>
          <Path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <Path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <Path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </Svg>
      );

    case 'briefcase':
      return (
        <Svg {...commonProps}>
          <Rect x="2" y="7" width="20" height="14" rx="3" />
          <Path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
          <Path d="M12 12v.01" />
        </Svg>
      );

    case 'plus':
      return (
        <Svg {...commonProps}>
          <Path d="M12 5v14M5 12h14" />
        </Svg>
      );

    case 'shield':
      return (
        <Svg {...commonProps}>
          <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <Path d="m9 12 2 2 4-4" />
        </Svg>
      );

    case 'message':
      return (
        <Svg {...commonProps}>
          <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </Svg>
      );

    case 'scale':
      return (
        <Svg {...commonProps}>
          <Path d="m16 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <Path d="m2 16 3-8 3 8c-.87.65-1.92 1-3 1s-2.13-.35-3-1Z" />
          <Path d="M7 21h10M12 3v18M3 7h2c2 0 5-1 7-2 2 1 5 2 7 2h2" />
        </Svg>
      );

    case 'check':
      return (
        <Svg {...commonProps}>
          <Path d="M20 6 9 17l-5-5" />
        </Svg>
      );

    case 'checkCircle':
      return (
        <Svg {...commonProps}>
          <Circle cx="12" cy="12" r="10" />
          <Path d="m9 12 2 2 4-4" />
        </Svg>
      );

    case 'search':
      return (
        <Svg {...commonProps}>
          <Circle cx="11" cy="11" r="8" />
          <Path d="m21 21-4.3-4.3" />
        </Svg>
      );

    case 'chevronRight':
      return (
        <Svg {...commonProps}>
          <Path d="m9 18 6-6-6-6" />
        </Svg>
      );

    case 'chevronLeft':
      return (
        <Svg {...commonProps}>
          <Path d="m15 18-6-6 6-6" />
        </Svg>
      );

    case 'copy':
      return (
        <Svg {...commonProps}>
          <Rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
          <Path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
        </Svg>
      );

    case 'externalLink':
      return (
        <Svg {...commonProps}>
          <Path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
          <Path d="M15 3h6v6" />
          <Path d="m10 14 11-11" />
        </Svg>
      );

    case 'sparkles':
      return (
        <Svg {...commonProps}>
          <Path d="m12 3 1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3Z" />
        </Svg>
      );

    case 'bell':
      return (
        <Svg {...commonProps}>
          <Path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <Path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </Svg>
      );

    case 'user':
      return (
        <Svg {...commonProps}>
          <Circle cx="12" cy="8" r="5" />
          <Path d="M20 21a8 8 0 0 0-16 0" />
        </Svg>
      );

    case 'clock':
      return (
        <Svg {...commonProps}>
          <Circle cx="12" cy="12" r="10" />
          <Path d="M12 6v6l4 2" />
        </Svg>
      );

    case 'dollar':
      return (
        <Svg {...commonProps}>
          <Circle cx="12" cy="12" r="10" />
          <Path d="M12 6v12M15 9.5a2.5 2.5 0 0 0-5 0c0 2.5 5 2.5 5 5a2.5 2.5 0 0 1-5 0" />
        </Svg>
      );

    case 'send':
      return (
        <Svg {...commonProps}>
          <Path d="m22 2-7 20-4-9-9-4Z" />
          <Path d="M22 2 11 13" />
        </Svg>
      );

    case 'lock':
      return (
        <Svg {...commonProps}>
          <Rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
          <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </Svg>
      );

    case 'arrowLeft':
      return (
        <Svg {...commonProps}>
          <Path d="m12 19-7-7 7-7M5 12h14" />
        </Svg>
      );

    case 'alertTriangle':
      return (
        <Svg {...commonProps}>
          <Path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
          <Path d="M12 9v4M12 17h.01" />
        </Svg>
      );

    case 'fileText':
      return (
        <Svg {...commonProps}>
          <Path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
        </Svg>
      );

    default:
      return null;
  }
};
