export default function BackgroundScene() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(57,208,255,0.08),transparent_32%),linear-gradient(225deg,rgba(53,240,177,0.06),transparent_36%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,8,23,0.32)_78%)]" />
    </div>
  );
}
