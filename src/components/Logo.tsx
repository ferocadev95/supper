import Image from "next/image";
import Link from "next/link";
import LogoImage from "../app/assets/logo-frutivida-transparente.png";

const Logo = () => {
  return (
    <Link href={"/"}>
      <Image
        src={LogoImage}
        alt="Logo de Frutivida"
        width={80}
        height={80}
        priority
      />
    </Link>
  );
};

export default Logo;
