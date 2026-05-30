import "dotenv/config";
import nodemailer from "nodemailer";

async function testSMTP() {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false, 
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  try {
    console.log("Mencoba koneksi ke SMTP...");
    await transporter.verify();
    console.log("Koneksi SMTP berhasil!");
  } catch (error) {
    console.error("Koneksi SMTP GAGAL:", error);
  } finally {
    process.exit(0);
  }
}

testSMTP();
