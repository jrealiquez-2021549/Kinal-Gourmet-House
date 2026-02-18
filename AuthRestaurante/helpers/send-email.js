import nodemailer from 'nodemailer'

export const sendVerificationEmail = async (email, token) => {

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

const verificationLink = `http://localhost:3005/api/auth/verify/${token}`

  await transporter.sendMail({
    from: `"Auth Restaurante" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verifica tu cuenta!',
    html: `
      <h2>Verifica tu cuenta</h2>
      <p>Haz click en el siguiente enlace para activar tu cuenta:</p>
      <br><br>
      <a href="${verificationLink}">${verificationLink}</a>
    `
  })
}
