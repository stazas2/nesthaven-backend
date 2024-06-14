import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.mail.ru',
  port: 465, // Используем порт 465 для SSL
  secure: true, // true для портов 465, false для других портов
  auth: {
    user: process.env.mail, // Убедитесь, что это ваш правильный адрес
    pass: process.env.mailPass, // Убедитесь, что это ваш правильный пароль
  },
});

const sendEmail = async (email, subject, html) => {
  try {
    const mailOptions = {
      from: `"NestHaven Support" <${process.env.mail}>`,
      to: email,
      subject: subject,
      html: html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending email: ' + error);
    throw new Error('Email sending failed');
  }
};

export default sendEmail;