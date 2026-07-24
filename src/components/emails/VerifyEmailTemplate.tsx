import {
  Button,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";

interface VerifyEmailTemplateProps {
  verifyUrl: string;
}

export function VerifyEmailTemplate({
  verifyUrl,
}: Readonly<VerifyEmailTemplateProps>): React.ReactElement {
  return (
    <Html>
      <Head />
      <Preview>Verifica tu correo para activar tu cuenta</Preview>
      <Tailwind>
        <Heading className="mx-0 my-[30px] p-0 text-center text-3xl font-bold text-black">
          🍅 Verifica tu correo 🍅
        </Heading>
        <Text className="text-center text-base text-black">
          Gracias por registrarte en Supper. Confirma tu correo para activar tu
          cuenta.
        </Text>
        <Section className="my-[32px] text-center">
          <Button
            className="text-md rounded-full bg-green-500 px-5 py-3 text-center font-semibold text-white no-underline"
            href={verifyUrl}
          >
            Verificar mi cuenta
          </Button>
        </Section>
        <Text className="text-center text-sm text-gray-500">
          Este enlace expira en 24 horas. Si no creaste esta cuenta, ignora este
          correo.
        </Text>
      </Tailwind>
    </Html>
  );
}
