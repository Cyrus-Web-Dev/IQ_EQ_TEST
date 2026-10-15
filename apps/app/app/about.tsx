import { useState } from "react";
import { DISCLAIMER, bankCounts } from "@tesiqeq/core";
import { resetAllData } from "../src/store";
import { Body, Button, Card, ConfirmDialog, H2, Screen } from "../src/ui";

export default function About() {
  const [confirm, setConfirm] = useState(false);
  const c = bankCounts();
  const total = (Object.values(c.iq) as number[]).reduce((a, b) => a + b, 0) + (Object.values(c.eq) as number[]).reduce((a, b) => a + b, 0);

  return (
    <Screen>
      <Card>
        <H2>Tes IQ & EQ v2</H2>
        <Body muted>Berjalan sepenuhnya offline. Tidak ada akun, tidak ada server, dan tidak ada data yang dikirim ke mana pun.</Body>
        <Body>Bank soal: {total} soal ({c.iq.easy + c.iq.normal + c.iq.hard + c.iq.extreme} IQ, {c.eq.easy + c.eq.normal + c.eq.hard + c.eq.extreme} EQ).</Body>
      </Card>

      <Card>
        <H2>Cara penilaian</H2>
        <Body>
          Mode satu tingkat: skor dibatasi rentang tingkat itu (Easy 70–100, Normal 85–115, Hard 100–130, Extreme 115–145), jadi sempurna di Easy tidak bisa mencapai skor tertinggi.
        </Body>
        <Body>Mode campuran: skor 70–145 berdasarkan akurasi berbobot, soal yang lebih sulit bernilai lebih besar. Soal yang waktunya habis dihitung salah.</Body>
      </Card>

      <Card>
        <H2>Catatan penting</H2>
        <Body muted>{DISCLAIMER}</Body>
      </Card>

      <Card>
        <H2>Data</H2>
        <Body muted>Riwayat tes dan daftar soal yang sudah muncul tersimpan di perangkat ini. Menghapusnya juga mengembalikan semua soal sebagai soal baru.</Body>
        <Button title="Hapus semua data" variant="danger" onPress={() => setConfirm(true)} />
      </Card>

      <ConfirmDialog
        visible={confirm}
        danger
        title="Hapus semua data?"
        message="Riwayat, statistik, dan lencana akan hilang. Tindakan ini tidak bisa dibatalkan."
        confirmLabel="Hapus"
        onConfirm={() => {
          resetAllData();
          setConfirm(false);
        }}
        onCancel={() => setConfirm(false)}
      />
    </Screen>
  );
}
