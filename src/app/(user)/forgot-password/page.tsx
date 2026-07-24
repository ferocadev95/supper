import { auth as nextAuth } from "../../../../auth";
import Container from "../../../components/Container";
import ForgotPasswordForm from "../../../components/ForgotPasswordForm";
import { redirect } from "next/navigation";

const ForgotPasswordPage = async () => {
  const session = await nextAuth();

  if (session?.user) {
    redirect("/");
  }

  return (
    <Container className="py-20 flex flex-col justify-center items-center min-h-[70vh]">
      <div className="p-10 bg-gray-100 rounded-2xl sm:min-w-[500px] sm:max-w-[500px]">
        <ForgotPasswordForm />
      </div>
    </Container>
  );
};

export default ForgotPasswordPage;
