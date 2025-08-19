export default function Logo({ onDarkBg = true }: { onDarkBg?: boolean }) {
  const textColor = onDarkBg ? 'text-sidebar-foreground' : 'text-foreground';
  return (
    <div className="flex items-center gap-3">
      <img src="https://upload.wikimedia.org/wikipedia/en/thumb/1/1e/Seal_of_Nagaland.svg/640px-Seal_of_Nagaland.svg.png" alt="Nagaland Government Logo" className="h-10 w-10" />
      <span className={`font-headline font-semibold text-lg ${textColor}`}>College App</span>
    </div>
  );
}
