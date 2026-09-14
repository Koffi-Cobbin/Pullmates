export default function FeedLoading() {
  return (
    <div className="mx-auto max-w-3xl p-6 animate-pulse">
      <div className="h-8 w-48 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="mt-6 space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-24 rounded-lg bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    </div>
  );
}
