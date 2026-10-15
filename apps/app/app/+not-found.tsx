import { Link } from "expo-router";
import { Body, H2, Screen } from "../src/ui";

export default function NotFound() {
  return (
    <Screen>
      <H2>Halaman tidak ditemukan</H2>
      <Body muted>Alamat yang kamu buka tidak ada di aplikasi ini.</Body>
      <Link href="/">
        <Body>Kembali ke beranda</Body>
      </Link>
    </Screen>
  );
}
