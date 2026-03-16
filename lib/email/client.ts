import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const EMAIL_FROM = 'Wepower <noreply@huuthi.com>';

export default resend;
