export function FormErrors({ errors }: { errors?: string[] }) {
  return (
    <ul className="py-2">
      {errors?.map((message) => (
        <p key={message} className="text-destructive">
          {message}
        </p>
      ))}
    </ul>
  );
}
