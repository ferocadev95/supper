import { auth as nextAuth } from "../../../../auth";
import Container from "../../../components/Container";
import LogOutButton from "../../../components/SignOutButton";
import { redirect } from "next/navigation";

const ProfilePage = async () => {
  const session = await nextAuth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <Container className="py-10 min-h-[70vh]">
      <h2 className="text-2xl font-semibold accent-bar">Mi Perfil</h2>
      <div className="flex items-center gap-3 my-5">
        <div>
          <p>{session?.user?.name}</p>
          <p>{session?.user?.email}</p>
        </div>
      </div>
      <LogOutButton />
    </Container>
  );
};

export default ProfilePage;
