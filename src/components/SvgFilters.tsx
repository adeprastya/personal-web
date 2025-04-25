interface FeGaussianBlurProps {
  id: string;
  x?: number;
  y?: number;
}
export function FeGaussianBlur({
  id,
  x = 0,
  y = 0,
}: FeGaussianBlurProps) {
  return (
    <svg style={{ display: "none" }}>
      <defs>
        <filter id={id}>
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={`${x} ${y}`}
            edgeMode="duplicate"
          />
        </filter>
      </defs>
    </svg>
  );
}
