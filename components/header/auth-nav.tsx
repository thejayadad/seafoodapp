// src/app/_components/auth/AuthNav.tsx
import { auth } from "@/auth"; // if not ready yet, mock a null return
import { signInWithGoogle, signOutUser } from "@/lib/user-auth";
import AuthButton from "./auth-pending";


export default async function AuthNav() {
  const session = await auth().catch(() => null);
  const isAuthed = Boolean(session?.user?.email);

  return (
    <>
      {isAuthed ? (
        <form action={signOutUser}>
          <AuthButton mode="signout" />
        </form>
      ) : (
        <form action={signInWithGoogle}>
          <AuthButton mode="signin" />
        </form>
      )}
    </>
  );
}
