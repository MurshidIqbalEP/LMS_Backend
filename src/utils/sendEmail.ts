import nodemailer from "nodemailer";

const sendEmail = async (to: string, subject: string, otp: string) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASS,
      },
    });

    const html = `
  <p>Hello,</p>
  <p>Your One Time Password (OTP) is: <strong>${otp}</strong></p>
  <p>This OTP is valid for 5 minutes.</p>
  <p>Thanks,<br/>Team Support</p>
`;

    await transporter.sendMail({
      from: process.env.EMAIL,
      to,
      subject: "🔐 Your One Time Password (OTP)",
      text: `Your OTP is ${otp}`,
      html,
    });

    return { success: true, message: "Email sent" };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, message: "Email failed", error };
  }
};

export default sendEmail;
