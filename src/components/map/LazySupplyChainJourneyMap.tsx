import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import type { SupplyChainJourneyMapProps } from './SupplyChainJourneyMap';

/**
 * The journey map is a large, interaction heavy component. It is loaded only
 * when a view that actually renders the map is opened, keeping it out of the
 * initial route chunks.
 */
const SupplyChainJourneyMap = React.lazy(() =>
  import('./SupplyChainJourneyMap').then(m => ({ default: m.SupplyChainJourneyMap })),
);

const MapFallback: React.FC = () => (
  <div className="w-full h-[320px] rounded-2xl border border-border bg-card/60 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      <span className="text-xs font-medium text-muted-foreground">Loading supply chain map...</span>
    </div>
  </div>
);

export const LazySupplyChainJourneyMap: React.FC<SupplyChainJourneyMapProps> = props => (
  <Suspense fallback={<MapFallback />}>
    <SupplyChainJourneyMap {...props} />
  </Suspense>
);

export { SupplyChainJourneyMapProps };

export default LazySupplyChainJourneyMap;
