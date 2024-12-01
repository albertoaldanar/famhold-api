import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export const sendVerificationCode = async (email, username, role) => {
  const code = Math.floor(100000 + Math.random() * 900000);

  const token = jwt.sign({ code, username, role }, process.env.JWT_SECRET, {
    expiresIn: "5m",
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass:  process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: '"Famhold - VFO" <albertoaldanar@gmail.com>',
    to: email,
    subject: "Codigo de verificación",
    text: `Tu código de verificación es: ${code}`,
  };

  try {
    const response = await transporter.sendMail(mailOptions);

    console.log("Email sent successfully:", response);

    return { success: true, token };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send verification email." };
  }
};

export const validateCode = (req, res) => {
  let token = req.headers.authorization;
  const { userCode } = req.body;

  token = token.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const code = decoded.code;
    const username = decoded.username;
    const role = decoded.role;

    if (code === userCode) {
      let userData;
      const jsonwToken = jwt.sign(
        { username, role },
        process.env.JWT_SECRET,
        {
          expiresIn: "5m",
        }
      );

      if(role === 'vfoUser'){
        userData = {familyId: 1, username, role }
      } else {
        userData = { username, role }
      }

      return res.status(200).json({ message: "Code validated successfully!", token: jsonwToken, data: userData });
    } else {
      return res.status(400).json({ message: "Invalid code." });
    }
  } catch (error) {
    console.error("Error validating token:", error);
    return res.status(400).json({ message: "Invalid or expired token." });
  }
};
