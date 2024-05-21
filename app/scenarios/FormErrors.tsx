export function FormErrors({ errors }: { errors?: string[] }) {
  return (
    <ul className="py-2">
      {errors?.map((message) => (
        <li key={message} className="text-destructive">
          {message}
        </li>
      ))}
    </ul>
  );
}
