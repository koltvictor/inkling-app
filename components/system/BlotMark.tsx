import Svg, { Path, Circle } from 'react-native-svg';

type Props = {
  size?: number;
  color?: string;
};

export function BlotMark({ size = 120, color = '#1A1714' }: Props) {
  return (
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Path
        d="M 42 36 C 30 36, 22 48, 26 62 C 16 68, 18 82, 30 88 C 36 98, 56 98, 66 90 C 80 94, 92 82, 86 70 C 96 64, 92 48, 78 50 C 78 38, 64 30, 54 36 C 50 32, 44 34, 42 36 Z"
        fill={color}
      />
      <Circle cx="96" cy="34" r="2.5" fill={color} />
    </Svg>
  );
}
