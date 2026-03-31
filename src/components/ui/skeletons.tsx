import { Skeleton } from "./skeleton";

// Hero Section Skeleton
export const HeroSkeleton = () => (
  <section className="relative min-h-[90vh] bg-white overflow-hidden">
    <div className="container mx-auto px-4 py-12 md:py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left: Content Skeleton */}
        <div className="space-y-8 lg:order-1">
          {/* Badge */}
          <Skeleton className="h-10 w-56 rounded-full" />

          {/* Title */}
          <div className="space-y-4">
            <Skeleton className="h-16 w-full max-w-lg" />
            <Skeleton className="h-16 w-3/4" />
            <Skeleton className="h-6 w-full max-w-md mt-4" />
            <Skeleton className="h-6 w-4/5 max-w-md" />
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
            <Skeleton className="h-10 w-32 rounded-full" />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4">
            <Skeleton className="h-14 w-40 rounded-full" />
            <Skeleton className="h-14 w-36 rounded-full" />
          </div>
        </div>

        {/* Right: Image Grid Skeleton */}
        <div className="relative lg:order-2">
          <div className="grid grid-cols-2 grid-rows-2 gap-4 h-[500px] md:h-[600px]">
            <Skeleton className="col-span-1 row-span-2 rounded-2xl" />
            <Skeleton className="rounded-2xl" />
            <Skeleton className="rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Plan Card Skeleton
export const PlanCardSkeleton = () => (
  <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
    {/* Badge area */}
    <div className="flex justify-between items-start mb-6">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-6 rounded-full" />
    </div>

    {/* Title */}
    <Skeleton className="h-8 w-32 mb-4" />

    {/* Price */}
    <div className="mb-6">
      <Skeleton className="h-12 w-24 mb-2" />
      <Skeleton className="h-4 w-16" />
    </div>

    {/* Speed gauge area */}
    <Skeleton className="h-24 w-full rounded-xl mb-6" />

    {/* Features */}
    <div className="space-y-3 mb-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 flex-1" />
        </div>
      ))}
    </div>

    {/* CTA Button */}
    <Skeleton className="h-12 w-full rounded-xl" />
  </div>
);

// Plans Section Skeleton
export const PlansSkeleton = () => (
  <section className="relative py-20 overflow-hidden bg-white">
    <div className="relative container mx-auto px-4">
      {/* Title */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-3 mb-4">
          <Skeleton className="w-12 h-px" />
          <Skeleton className="h-14 w-64" />
          <Skeleton className="w-12 h-px" />
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-24">
        {[1, 2, 3].map((i) => (
          <PlanCardSkeleton key={i} />
        ))}
      </div>

      {/* CTA Button */}
      <div className="text-center mx-auto max-w-md mb-32">
        <Skeleton className="h-16 w-full rounded-2xl" />
      </div>
    </div>
  </section>
);

// Feature Card Skeleton
export const FeatureCardSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-xl">
    {/* Image */}
    <Skeleton className="h-48 w-full" />

    {/* Content */}
    <div className="p-6">
      <Skeleton className="h-6 w-3/4 mb-3" />
      <Skeleton className="h-4 w-full mb-2" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);

// Features Section Skeleton
export const FeaturesSkeleton = () => (
  <section className="relative py-16 md:py-24 overflow-hidden bg-white">
    <div className="relative container mx-auto px-4 md:px-6">
      {/* Title */}
      <div className="text-center mb-12 md:mb-16">
        <Skeleton className="h-14 w-72 mx-auto mb-4" />
        <Skeleton className="h-6 w-96 max-w-full mx-auto" />
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {[1, 2, 3, 4].map((i) => (
          <FeatureCardSkeleton key={i} />
        ))}
      </div>

      {/* CTA */}
      <div className="mt-12 md:mt-16 text-center">
        <Skeleton className="h-14 w-48 mx-auto rounded-full" />
      </div>
    </div>
  </section>
);

// Dealer Card Skeleton
export const DealerCardSkeleton = () => (
  <div className="bg-white rounded-xl p-4 shadow-md">
    <div className="flex items-start gap-3">
      <Skeleton className="w-12 h-12 rounded-xl flex-shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-5 w-32 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  </div>
);

// Speed Test Section Skeleton
export const SpeedTestSkeleton = () => (
  <section className="relative py-16 overflow-hidden bg-gradient-to-br from-coolnet-purple to-coolnet-purple-dark">
    <div className="container mx-auto px-4">
      <div className="text-center mb-8">
        <Skeleton className="h-12 w-64 mx-auto mb-4 bg-white/10" />
        <Skeleton className="h-6 w-96 max-w-full mx-auto bg-white/10" />
      </div>

      {/* Speed gauge placeholder */}
      <div className="flex justify-center">
        <Skeleton className="w-64 h-64 rounded-full bg-white/10" />
      </div>
    </div>
  </section>
);

// Table Row Skeleton
export const TableRowSkeleton = ({ columns = 4 }: { columns?: number }) => (
  <tr className="border-b border-gray-100">
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

// Generic Card Skeleton
export const CardSkeleton = ({ className = "" }: { className?: string }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
    <Skeleton className="h-6 w-3/4 mb-4" />
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6 mb-4" />
    <Skeleton className="h-10 w-32 rounded-lg" />
  </div>
);
