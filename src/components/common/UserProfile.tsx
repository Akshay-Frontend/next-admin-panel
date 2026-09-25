import { useAuth } from "@/context/AuthContext";
import { LogoutButton } from "../auth/LogoutButton";

function UserProfile() {
  const { user } = useAuth();

  return (
    <>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              Product Admin
            </h1>
            {user && (
              <p className="text-xs text-slate-500">
                Signed in as {user.username}
              </p>
            )}
          </div>
          <LogoutButton />
        </div>
      </header>
    </>
  );
}

export default UserProfile ;
