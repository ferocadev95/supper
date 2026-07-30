import Container from "../../../components/Container";
import ResetPasswordForm from "../../../components/ResetPasswordForm";
import Link from "next/link";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

const ResetPasswordPage = async ({ searchParams }: ResetPasswordPageProps) => {
  const { token } = await searchParams;

  return (
    <Container className="py-20 flex flex-col justify-center items-center min-h-[70vh]">
      <div className="p-10 bg-gray-100 rounded-2xl sm:min-w-[500px] sm:max-w-[500px]">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="font-bold text-lg md:text-xl">Enlace inválido</h2>
            <p className="text-gray-600">
              El enlace para restablecer la contraseña no es válido.
            </p>
            <Link
              href="/forgot-password"
              className="text-primaryGreen hover:underline"
            >
              Solicitar un nuevo enlace
            </Link>
          </div>
        )}
      </div>
    </Container>
  );
};

export default ResetPasswordPage;
