import transporter from "../config/mail.js";
import logger from "./logger.js";

const sendMail = async (email, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: email,
      subject,
      html
    });
  
    logger.info(`Email has been sent to ${email}: ${info.messageId}`);
  } catch(e) {
    logger.error(e);
  }
}

export default sendMail;