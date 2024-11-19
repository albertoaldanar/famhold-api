import jwt from "jsonwebtoken";
import emailjs from "emailjs-com";

export const sendVerificationCode = async (email) => {
  const code = Math.floor(100000 + Math.random() * 900000);

  const token = jwt.sign({ code }, process.env.JWT_SECRET, {
    expiresIn: "2m",
  });

  const templateParams = {
    to_email: email,
    message: `Tu código de verificación es: ${code}`,
  };

  try {
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      process.env.EMAILJS_PUBLIC_KEY
    );

    console.log("Email sent successfully:", response);

    return { success: true, token };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: "Failed to send verification email." };
  }
};

export const validateCode = (req, res) => {
  const { token, userCode, role, username } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.code === userCode) {
      const jsonwToken = jwt.sign(
        { username, role },
        process.env.JWT_SECRET,
        {
          expiresIn: "5m",
        }
      );

      return res.status(200).json({ message: "Code validated successfully!", token: jsonwToken });
    } else {
      return res.status(400).json({ message: "Invalid code." });
    }
  } catch (error) {
    console.error("Error validating token:", error);
    return res.status(400).json({ message: "Invalid or expired token." });
  }
};
