import nodemailer from 'nodemailer';

if (!process.env.EMAIL_USER || !process.env.APP_PASSWORD) {
  throw new Error('EMAIL_USER and APP_PASSWORD must be set!');
}

export function sendEmail({
  emailAddress,
  emailSubject,
  htmlText,
}: {
  emailAddress: string;
  emailSubject: string;
  htmlText: string;
}) {
  try {
    const mailConfig = {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.APP_PASSWORD,
      },
    };

    const transporter = nodemailer.createTransport(mailConfig);

    const mailDetails = {
      from: 'DevKit',
      to: emailAddress,
      subject: emailSubject,
      html: htmlText,
    };

    transporter.sendMail(mailDetails);
  } catch (error) {
    // console.error('Nodemailer send mail error', error);
    return error;
  }
}
