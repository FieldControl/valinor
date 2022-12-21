interface HeadingProps {
  total: number | string;
}
export function Heading({ total }: HeadingProps) {
  return (
    <h1 className="text-xl m-4" id="Result">
      Showing: {total} Results
    </h1>
  );
}
