// src/app/_components/auth/AuthNavMobile.tsx
import { auth } from "@/auth";
import { signInWithGoogle, signOutUser } from "@/lib/user-auth";
import AuthButton from "./auth-pending";


export default async function AuthNavMobile() {
  const session = await auth().catch(() => null);
  const isAuthed = Boolean(session?.user?.email);

  return (
    <div className="mt-2">
      {isAuthed ? (
        <form action={signOutUser}>
          <AuthButton mode="signout" className="w-full justify-start" />
        </form>
      ) : (
        <form action={signInWithGoogle}>
          <AuthButton mode="signin" className="w-full justify-start" />
        </form>
      )}
    </div>
  );
}
