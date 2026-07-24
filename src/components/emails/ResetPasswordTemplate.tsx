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

interface ResetPasswordTemplateProps {
  resetUrl: string;
}

export function ResetPasswordTemplate({
  resetUrl,
}: Readonly<ResetPasswordTemplateProps>): React.ReactElement {
  return (
    <Html>
      <Head />
      <Preview>Restablece tu contraseña de Supper</Preview>
      <Tailwind>
        <Heading className="mx-0 my-[30px] p-0 text-center text-3xl font-bold text-black">
          🍅 Restablecer contraseña 🍅
        </Heading>
        <Text className="text-center text-base text-black">
          Recibimos una solicitud para restablecer tu contraseña. Haz clic en el
          botón para crear una nueva.
        </Text>
        <Section className="my-[32px] text-center">
          <Button
            className="text-md rounded-full bg-red-500 px-5 py-3 text-center font-semibold text-white no-underline"
            href={resetUrl}
          >
            Crear nueva contraseña
          </Button>
        </Section>
        <Text className="text-center text-sm text-gray-500">
          Este enlace expira en 1 hora. Si no solicitaste este cambio, ignora
          este correo; tu contraseña seguirá igual.
        </Text>
      </Tailwind>
    </Html>
  );
}
