import React from "react";

interface CircularProgressProps {
  value: number; // İlerleme yüzdesi
  color?: string; // İsteğe bağlı renk
}

const CircularProgress: React.FC<CircularProgressProps> = ({ value, color = "#3b82f6" }) => {
  const radius = 20; // Dairenin yarıçapı
  const strokeWidth = 4; // Çizgi kalınlığı
  const normalizedRadius = radius - strokeWidth * 0.5; // Normalleştirilmiş yarıçap
  const circumference = normalizedRadius * 2 * Math.PI; // Dairenin çevresi
  const safeValue = isNaN(value) ? 0 : Math.max(0, Math.min(100, value)); // Ensure value is a valid number between 0 and 100
  const strokeDashoffset = circumference - (safeValue / 100) * circumference; // Çizgi kaydırma

  return (
    <svg height={radius * 2} width={radius * 2}>
      <circle
        stroke="#e6e6e6"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke={color} // Renk burada kullanılıyor
        fill="transparent"
        strokeWidth={strokeWidth}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        strokeDasharray={circumference + " " + circumference}
        strokeDashoffset={strokeDashoffset}
        style={{ transition: "stroke-dashoffset 0.5s ease 0s" }}
      />
    </svg>
  );
};

export default CircularProgress;