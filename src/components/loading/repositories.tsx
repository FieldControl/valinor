const SkeletonLoadingItem = () => (
  <div className="bg-gray-800 p-4 rounded-lg mb-4 flex flex-row justify-between cursor-pointer animate-pulse h-24 space-x-5">
    <div className="flex-1 h-full">
      <div className="h-3/5 bg-gray-700 rounded mb-2"></div>
      <div className="h-2/5 bg-gray-600 rounded"></div>
    </div>
    <div>
      <div className="h-8 w-24 bg-blue-500 rounded mb-2"></div>
    </div>
  </div>
);

export const SkeletonLoading = () => {
  return (
    <div className="flex flex-col">
      <SkeletonLoadingItem />
      <SkeletonLoadingItem />
      <SkeletonLoadingItem />
      <SkeletonLoadingItem />
      <SkeletonLoadingItem />
    </div>
  );
};
