import SuccessContainer from "../../../components/SuccessContainer";
import { redirect } from "next/navigation";
import Stripe from "stripe";

interface Props {
  searchParams: Promise<{
    session_id: string | null;
  }>;
}

const SuccessPage = async ({ searchParams }: Props) => {
  const { session_id } = await searchParams;

  if (!session_id) {
    redirect("/");
  }

  let phoneNumber: string | null = null;
  if (process.env.STRIPE_SECRET_KEY && session_id) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-06-24.dahlia",
    });
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);
      phoneNumber = session.customer_details?.phone || null;
    } catch (e) {
      console.error("Error retrieving session:", e);
    }
  }

  return (
    <div>
      <SuccessContainer id={session_id} phoneNumber={phoneNumber} />
    </div>
  );
};

export default SuccessPage;
