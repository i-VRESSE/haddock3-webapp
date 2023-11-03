export function ReWarning({ title }: { title: string }) {
  // TODO allow user to hide this warning forever, by setting a cookie or local storage or something?
  return (
    <div
      className="border-l-4 border-yellow-500 bg-yellow-100 p-4 text-yellow-700"
      role="alert"
    >
      <p className="font-bold">Warning</p>
      <p>
        {title} will only run on selected module and have no effect on output of
        downstream modules.
      </p>
    </div>
  );
}
