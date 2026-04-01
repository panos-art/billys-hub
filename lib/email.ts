import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@billys.gr";

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailParams) {
  if (!resend) {
    console.log(`[Email] Would send to ${to}: ${subject}`);
    return;
  }

  try {
    await resend.emails.send({
      from: `Billys Hub <${FROM_EMAIL}>`,
      to,
      subject,
      html: wrapEmailTemplate(subject, html),
    });
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}

function wrapEmailTemplate(title: string, body: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Manrope', Arial, sans-serif; background: #F4F7F9; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; overflow: hidden; }
        .header { background: #00203D; padding: 24px; text-align: center; }
        .header .logo { font-size: 24px; font-weight: 700; }
        .header .logo .billys { color: #1C4E89; }
        .header .logo .hub { color: #00B1C9; }
        .body { padding: 32px 24px; color: #333; line-height: 1.6; }
        .footer { background: #F4F7F9; padding: 16px 24px; text-align: center; color: #666; font-size: 13px; }
        .btn { display: inline-block; background: #1C4E89; color: #fff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; }
        .badge-approved { background: #7BCFB5; color: #fff; padding: 4px 12px; border-radius: 20px; font-weight: 700; }
        .badge-rejected { background: #E53E3E; color: #fff; padding: 4px 12px; border-radius: 20px; font-weight: 700; }
        .badge-pending { background: #F39257; color: #fff; padding: 4px 12px; border-radius: 20px; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo"><span class="billys">billys</span><span class="hub">hub</span></div>
        </div>
        <div class="body">
          ${body}
        </div>
        <div class="footer">
          Η ομάδα του Billys Hub
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendLeaveRequestEmail(
  managerEmail: string,
  employeeName: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  workingDays: number
) {
  await sendEmail({
    to: managerEmail,
    subject: `Νέο αίτημα άδειας από ${employeeName}`,
    html: `
      <h2>Νέο Αίτημα Άδειας</h2>
      <p>Ο/Η <strong>${employeeName}</strong> υπέβαλε αίτημα άδειας:</p>
      <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
        <tr><td style="padding:8px; border-bottom:1px solid #eee; color:#666;">Τύπος:</td><td style="padding:8px; border-bottom:1px solid #eee;"><strong>${leaveType}</strong></td></tr>
        <tr><td style="padding:8px; border-bottom:1px solid #eee; color:#666;">Από:</td><td style="padding:8px; border-bottom:1px solid #eee;">${startDate}</td></tr>
        <tr><td style="padding:8px; border-bottom:1px solid #eee; color:#666;">Έως:</td><td style="padding:8px; border-bottom:1px solid #eee;">${endDate}</td></tr>
        <tr><td style="padding:8px; color:#666;">Εργάσιμες μέρες:</td><td style="padding:8px;">${workingDays}</td></tr>
      </table>
      <p style="text-align:center; margin-top:24px;">
        <a href="${process.env.NEXTAUTH_URL}/leaves" class="btn">Δες το αίτημα</a>
      </p>
    `,
  });
}

export async function sendLeaveApprovedEmail(
  employeeEmail: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  approverName: string
) {
  await sendEmail({
    to: employeeEmail,
    subject: `Η άδειά σου εγκρίθηκε ✓`,
    html: `
      <h2>Άδεια Εγκρίθηκε <span class="badge-approved">Εγκρίθηκε</span></h2>
      <p>Η άδεια <strong>${leaveType}</strong> σου εγκρίθηκε από τον/την ${approverName}.</p>
      <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
        <tr><td style="padding:8px; border-bottom:1px solid #eee; color:#666;">Από:</td><td style="padding:8px; border-bottom:1px solid #eee;">${startDate}</td></tr>
        <tr><td style="padding:8px; color:#666;">Έως:</td><td style="padding:8px;">${endDate}</td></tr>
      </table>
    `,
  });
}

export async function sendLeaveRejectedEmail(
  employeeEmail: string,
  leaveType: string,
  startDate: string,
  endDate: string,
  approverName: string,
  comment?: string
) {
  await sendEmail({
    to: employeeEmail,
    subject: `Η άδειά σου απορρίφθηκε`,
    html: `
      <h2>Άδεια Απορρίφθηκε <span class="badge-rejected">Απορρίφθηκε</span></h2>
      <p>Η άδεια <strong>${leaveType}</strong> σου απορρίφθηκε από τον/την ${approverName}.</p>
      <table style="width:100%; border-collapse:collapse; margin: 16px 0;">
        <tr><td style="padding:8px; border-bottom:1px solid #eee; color:#666;">Από:</td><td style="padding:8px; border-bottom:1px solid #eee;">${startDate}</td></tr>
        <tr><td style="padding:8px; color:#666;">Έως:</td><td style="padding:8px;">${endDate}</td></tr>
      </table>
      ${comment ? `<p><strong>Σχόλιο:</strong> ${comment}</p>` : ""}
    `,
  });
}

export async function sendPendingLeaveReminderEmail(
  hrEmail: string,
  pendingCount: number
) {
  await sendEmail({
    to: hrEmail,
    subject: `${pendingCount} αιτήματα άδειας σε αναμονή > 48 ώρες`,
    html: `
      <h2>Εκκρεμή Αιτήματα Αδειών</h2>
      <p>Υπάρχουν <strong>${pendingCount}</strong> αιτήματα αδειών που βρίσκονται σε αναμονή περισσότερο από 48 ώρες.</p>
      <p style="text-align:center; margin-top:24px;">
        <a href="${process.env.NEXTAUTH_URL}/admin" class="btn">Δες τα αιτήματα</a>
      </p>
    `,
  });
}
