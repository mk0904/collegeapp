import { Mountain } from 'lucide-react';

export default function Logo() {
  return (
    <div className="flex items-center gap-2 bg-primary text-primary-foreground p-2 rounded-lg">
      <Mountain className="h-6 w-6" />
      <span className="font-headline font-semibold text-lg">NagaAdmin</span>
    </div>
  );
}
