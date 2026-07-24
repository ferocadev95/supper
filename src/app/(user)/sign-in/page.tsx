import { signIn, auth as nextAuth } from "../../../../auth";
import Container from "../../../components/Container";
import googleImage from "../../assets/googleImage.png";
import Image from "next/image";
import { redirect } from "next/navigation";
import CredentialsSignInForm from "../../../components/CredentialsSignInForm";

const SignInPage = async () => {
  const session = await nextAuth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <Container className="py-20 flex flex-col justify-center items-center min-h-[70vh]">
      <div className="p-10 bg-gray-100 rounded-2xl sm:min-w-[500px] sm: max-w-[500px]">
        <div className="flex flex-col mt-4 gap-3">
          <h2 className="font-bold text-lg md:text-xl">
            Inicia sesión o Regístrate
          </h2>
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
            className="flex items-center justify-center gap-2 "
          >
            <button
              type="submit"
              className="flex items-center justify-center w-full border border-blue-500 font-semibold bg-blue-50 px-4 py-1.5 hover:bg-blue-800 hover:text-white hoverEffect rounded-md"
            >
              <Image src={googleImage} alt="google-logo" className="w-8 mr-2" />
              <p>Iniciar sesión con Google</p>
            </button>
          </form>
        </div>
        <CredentialsSignInForm />
      </div>
    </Container>
  );
};

export default SignInPage;
