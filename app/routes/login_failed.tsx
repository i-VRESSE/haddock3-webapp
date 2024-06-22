export default function LoginFailed() {
  return (
    <main className="flex flex-col justify-center items-center w-[30rem] m-auto p-12">
      <h1 className="text-3xl">Login failed</h1>
      <p className="py-4">
        This can have various reasons. If you used multiple login methods in the
        past, try using a different method. If the problem persist please notify
        the administrator.
      </p>
      <a href="/login">
        <u>Try again</u>
      </a>
    </main>
  );
}
