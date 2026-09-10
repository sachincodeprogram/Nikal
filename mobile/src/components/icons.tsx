// Hand-drawn duotone line-icon set matching the Nikal design mockup —
// soft tinted fill + bold stroke for primary content icons, plain
// stroke for small inline/status glyphs. Never use emoji as icons.
import React from "react";
import { Circle, Line, Path, Polyline, Rect, Svg } from "react-native-svg";

export interface IconProps {
  size?: number;
  color?: string;
}

export function PinIcon({ size = 18, color = "#00655C" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 21c-4.2-4.4-6.4-8-6.4-11A6.4 6.4 0 0 1 12 3.6a6.4 6.4 0 0 1 6.4 6.4c0 3-2.2 6.6-6.4 11z"
        fill={color}
        fillOpacity={0.16}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={10.2} r={2.1} fill={color} />
    </Svg>
  );
}

export function CalendarIcon({ size = 18, color = "#B4790C" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={3.5} y={5.5} width={17} height={15} rx={2.5} fill={color} fillOpacity={0.14} stroke={color} strokeWidth={1.8} />
      <Rect x={3.5} y={5.5} width={17} height={4.5} rx={2.5} fill={color} fillOpacity={0.32} />
      <Line x1={8} y1={3.2} x2={8} y2={7} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={16} y1={3.2} x2={16} y2={7} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function SearchIcon({ size = 20, color = "#00655C" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={10.5} cy={10.5} r={6.5} fill={color} fillOpacity={0.16} stroke={color} strokeWidth={1.9} />
      <Line x1={15.4} y1={15.4} x2={21} y2={21} stroke={color} strokeWidth={2.1} strokeLinecap="round" />
    </Svg>
  );
}

export function CarIcon({ size = 20, color = "#00655C" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M4 16v-3.2a2 2 0 0 1 .4-1.2l2-2.7a2 2 0 0 1 1.6-.9h8a2 2 0 0 1 1.6.9l2 2.7a2 2 0 0 1 .4 1.2V16"
        fill={color}
        fillOpacity={0.16}
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 16h18v1.6a.9.9 0 0 1-.9.9h-1.4a.9.9 0 0 1-.9-.9V17H6.2v.6a.9.9 0 0 1-.9.9H3.9a.9.9 0 0 1-.9-.9z"
        fill={color}
        fillOpacity={0.28}
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={7.5} cy={16} r={1.4} fill={color} />
      <Circle cx={16.5} cy={16} r={1.4} fill={color} />
    </Svg>
  );
}

export function BikeIcon({ size = 20, color = "#B4790C" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={5.5} cy={17} r={3} fill={color} fillOpacity={0.16} stroke={color} strokeWidth={1.6} />
      <Circle cx={18.5} cy={17} r={3} fill={color} fillOpacity={0.16} stroke={color} strokeWidth={1.6} />
      <Path d="M5.5 17 9 10h4l2 3.5" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 10 7.5 7h3" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Path d="M13 13.5h5.5" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
      <Path d="M11 17h7.5" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

export function StarIcon({ size = 13, color = "#F0A93B" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.2 1.3-6.6-4.9-4.6 6.6-.8z" fill={color} />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = 19, color = "#152220" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polyline points="15 5 8 12 15 19" fill="none" stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function ChevronRightIcon({ size = 17, color = "#B7C1BF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polyline points="9 5 16 12 9 19" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function UserIcon({ size = 18, color = "#3E4C49" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={8} r={3.6} fill={color} fillOpacity={0.18} stroke={color} strokeWidth={1.7} />
      <Path
        d="M4.5 20c.6-4 3.5-6.2 7.5-6.2s6.9 2.2 7.5 6.2"
        fill={color}
        fillOpacity={0.12}
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

export function SeatIcon({ size = 15, color = "#8C9997" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 4.5v7a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-7" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 11.5H6a2 2 0 0 0-2 2v4.5" stroke={color} strokeWidth={1.7} strokeLinecap="round" fill="none" />
      <Path d="M17 11.5h1a2 2 0 0 1 2 2v4.5" stroke={color} strokeWidth={1.7} strokeLinecap="round" fill="none" />
      <Path d="M6 19.5h12" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function ShieldCheckIcon({ size = 15, color = "#00857A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M12 3.5 5 6v5.5c0 4.6 3 7.7 7 9 4-1.3 7-4.4 7-9V6z"
        fill={color}
        fillOpacity={0.18}
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Polyline points="9 12 11.2 14.2 15.2 10" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function LogOutIcon({ size = 15, color = "#E5484D" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Polyline points="15 8 19 12 15 16" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Line x1={19} y1={12} x2={9} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

export function PlusCircleIcon({ size = 18, color = "#3E4C49" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} fill={color} fillOpacity={0.14} stroke={color} strokeWidth={1.8} />
      <Line x1={12} y1={8} x2={12} y2={16} stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Line x1={8} y1={12} x2={16} y2={12} stroke={color} strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  );
}

export function CheckIcon({ size = 12, color = "#FFFFFF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Polyline points="4 12.5 9.5 18 20 6" fill="none" stroke={color} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function XIcon({ size = 12, color = "#3E4C49" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1={5} y1={5} x2={19} y2={19} stroke={color} strokeWidth={2.6} strokeLinecap="round" />
      <Line x1={19} y1={5} x2={5} y2={19} stroke={color} strokeWidth={2.6} strokeLinecap="round" />
    </Svg>
  );
}

export function ClockIcon({ size = 13, color = "#8C9997" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={9} fill="none" stroke={color} strokeWidth={2.1} />
      <Polyline points="12 7 12 12 15.5 14" fill="none" stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function FlagIcon({ size = 12, color = "#3E4C49" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1={5} y1={3} x2={5} y2={21} stroke={color} strokeWidth={2.2} strokeLinecap="round" />
      <Path d="M5 4.5h11l-2.4 3.5L16 11.5H5" fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function MegaphoneIcon({ size = 18, color = "#B4790C" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 10.5v3a1.5 1.5 0 0 0 1.5 1.5H6l1 5h2l-.8-5h1.3l7 3.5v-13l-7 3.5H4.5A1.5 1.5 0 0 0 3 10.5z"
        fill={color}
        fillOpacity={0.18}
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M18.5 9a4.5 4.5 0 0 1 0 6" fill="none" stroke={color} strokeWidth={1.7} strokeLinecap="round" />
    </Svg>
  );
}

export function TicketIcon({ size = 18, color = "#3856C9" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1.2a1.6 1.6 0 0 0 0 3.1V15a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1.7a1.6 1.6 0 0 0 0-3.1z"
        fill={color}
        fillOpacity={0.16}
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line x1={14.5} y1={7.3} x2={14.5} y2={16.7} stroke={color} strokeWidth={1.7} strokeDasharray="2.2,2.2" strokeLinecap="round" />
    </Svg>
  );
}

export function PhoneIcon({ size = 18, color = "#00857A" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path
        d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2 4 1.5v3a1.5 1.5 0 0 1-1.6 1.5A17 17 0 0 1 5 6.1 1.5 1.5 0 0 1 6.5 3.5z"
        fill={color}
        fillOpacity={0.16}
        stroke={color}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ArrowRightIcon({ size = 18, color = "#FFFFFF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Line x1={4} y1={12} x2={18} y2={12} stroke={color} strokeWidth={2.1} strokeLinecap="round" />
      <Polyline points="12 6 18 12 12 18" fill="none" stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function SwapIcon({ size = 16, color = "#6C7A78" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M7 4v14" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Polyline points="3.5 8 7 4.2 10.5 8" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17 20V6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Polyline points="13.5 16 17 19.8 20.5 16" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

export function RouteMarkIcon({ size = 26, color = "#FFFFFF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={5.5} cy={18.5} r={2} fill="none" stroke={color} strokeWidth={2} />
      <Circle cx={18.5} cy={5.5} r={2} fill="none" stroke={color} strokeWidth={2} />
      <Line x1={7} y1={17} x2={17} y2={7} stroke={color} strokeWidth={2} strokeLinecap="round" strokeDasharray="0.2,3.6" />
    </Svg>
  );
}
