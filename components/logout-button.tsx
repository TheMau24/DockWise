/**
 * Botón de cierre de sesión. Es un formulario que hace POST a /auth/signout,
 * por lo que funciona sin JavaScript del cliente y puede usarse tanto en
 * Server como en Client Components.
 */
export function LogoutButton({ className }: { className?: string }) {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className={
          className ??
          "rounded-xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        }
      >
        Cerrar sesión
      </button>
    </form>
  );
}
