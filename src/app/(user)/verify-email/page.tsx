import Container from "../../../components/Container";
import Link from "next/link";
import { verifyEmail } from "../../../server/actions/verify-email-action";

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

const VerifyEmailPage = async ({ searchParams }: VerifyEmailPageProps) => {
  const { token } = await searchParams;
  const result = await verifyEmail(token);

  return (
    <Container className="py-20 flex flex-col justify-center items-center min-h-[70vh]">
      <div className="p-10 bg-gray-100 rounded-2xl sm:min-w-[500px] sm:max-w-[500px] flex flex-col gap-4 text-center">
        <h2 className="font-bold text-lg md:text-xl">
          Verificación de correo
        </h2>
        <p className={result.ok ? "text-green-600" : "text-red-500"}>
          {result.message}
        </p>
        {result.ok ? (
          <Link
            href="/sign-in"
            className="btn-primary px-4 py-3 rounded-full"
          >
            Iniciar sesión
          </Link>
        ) : (
          <Link
            href="/sign-up"
            className="text-primaryGreen hover:underline"
          >
            Volver a registrarse
          </Link>
        )}
      </div>
    </Container>
  );
};

export default VerifyEmailPage;
