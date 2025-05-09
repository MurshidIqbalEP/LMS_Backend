
import nodemailer from "nodemailer";

const sendEmail = async (to: string, subject: string, text: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject,
      text,
    });

    console.log("Email sent: ", info.response);
    return { success: true, message: "Email sent" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Email failed", error };
  }
};

export default sendEmail;
