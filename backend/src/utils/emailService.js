import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Create reusable transporter object using the default SMTP transport
const createTransporter = async () => {
  // If SMTP configs exist in .env, use them (Gmail, SendGrid, etc.)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Fallback to Ethereal Email for development & testing (zero config needed)
  console.log('⚠️  No SMTP credentials in .env — using Ethereal Email (test mode).');
  console.log('📬 Emails will NOT reach real inboxes. Preview URL will be logged below.');
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = await createTransporter();
    const info = await transporter.sendMail({
      from: process.env.FROM_EMAIL || '"Nexura Solutions" <noreply@nexurasolutions.com>',
      to,
      subject,
      html,
    });
    console.log('✅ Message sent:', info.messageId);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) console.log('🔗 Preview URL:', previewUrl);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error.message);
    return false;
  }
};

// ─────────────────────────────────────────────────────────
//  Exported email service methods
// ─────────────────────────────────────────────────────────
export const emailService = {

  // 1. Welcome email when Admin creates a new employee
  sendWelcomeEmail: (email, firstName, rawPassword) => {
    const subject = 'Welcome to Nexura Solutions! 🚀';
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="background:#3b82f6;padding:24px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:24px">Welcome to Nexura Solutions!</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb">
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>Your Nexura Solutions employee account has been created. Use the credentials below to log in for the first time.</p>
          <div style="background:#fff;border:1px solid #d1d5db;border-radius:6px;padding:16px;margin:20px 0">
            <p style="margin:0 0 8px 0"><strong>Login Email:</strong> ${email}</p>
            <p style="margin:0"><strong>Temporary Password:</strong> <code style="background:#f3f4f6;padding:2px 6px;border-radius:4px">${rawPassword}</code></p>
          </div>
          <p style="color:#ef4444;font-size:13px">⚠️ Please change your password immediately after first login.</p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/employee/login"
             style="display:inline-block;background:#3b82f6;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold;margin-top:8px">
            Log In Now →
          </a>
          <br/><br/>
          <p style="color:#6b7280;font-size:13px">Nexura Solutions · noreply@nexurasolutions.com</p>
        </div>
      </div>`;
    return sendEmail({ to: email, subject, html });
  },

  // 2. Password reset email
  sendPasswordResetEmail: (email, resetToken) => {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;
    const subject = 'Password Reset Request – Nexura Solutions';
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="background:#3b82f6;padding:24px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:24px">Password Reset</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb">
          <p>You requested a password reset for your Nexura Solutions account.</p>
          <p>Click the button below — this link expires in <strong>10 minutes</strong>.</p>
          <div style="text-align:center;margin:24px 0">
            <a href="${resetUrl}"
               style="display:inline-block;background:#3b82f6;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:bold">
              Reset My Password
            </a>
          </div>
          <p style="font-size:12px;color:#9ca3af">If you did not request this, ignore this email. Your password won't change.</p>
          <p style="color:#6b7280;font-size:13px">Nexura Solutions · noreply@nexurasolutions.com</p>
        </div>
      </div>`;
    return sendEmail({ to: email, subject, html });
  },

  // 3. Task assignment notification email
  sendTaskAssignmentEmail: (email, firstName, taskTitle, projectName, dueDate) => {
    const formattedDate = dueDate ? new Date(dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Not set';
    const subject = `New Task Assigned: ${taskTitle}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="background:#6366f1;padding:24px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">📋 New Task Assigned</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb">
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>A new task has been assigned to you on the Employee Portal.</p>
          <div style="background:#fff;border:1px solid #d1d5db;border-radius:6px;padding:16px;margin:20px 0">
            <p style="margin:0 0 8px 0"><strong>Task:</strong> ${taskTitle}</p>
            <p style="margin:0 0 8px 0"><strong>Project:</strong> ${projectName}</p>
            <p style="margin:0"><strong>Due Date:</strong> ${formattedDate}</p>
          </div>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/employee/tasks"
             style="display:inline-block;background:#6366f1;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
            View Task →
          </a>
          <br/><br/>
          <p style="color:#6b7280;font-size:13px">Nexura Solutions · noreply@nexurasolutions.com</p>
        </div>
      </div>`;
    return sendEmail({ to: email, subject, html });
  },

  // 4. Leave status update (Approved / Rejected)
  sendLeaveStatusEmail: (email, firstName, leaveType, status) => {
    const isApproved = status === 'Approved';
    const statusColor = isApproved ? '#10b981' : '#ef4444';
    const subject = `Leave Request ${status} – Nexura Solutions`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="background:${statusColor};padding:24px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">${isApproved ? '✅' : '❌'} Leave Request ${status}</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb">
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>Your <strong>${leaveType}</strong> request has been <strong style="color:${statusColor}">${status.toLowerCase()}</strong> by the admin.</p>
          ${!isApproved ? '<p>You may contact HR for further clarification.</p>' : '<p>Enjoy your time off!</p>'}
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/employee/leave"
             style="display:inline-block;background:${statusColor};color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
            View Details →
          </a>
          <br/><br/>
          <p style="color:#6b7280;font-size:13px">Nexura Solutions · noreply@nexurasolutions.com</p>
        </div>
      </div>`;
    return sendEmail({ to: email, subject, html });
  },

  // 5. Contact form submission notification to admin
  sendContactFormEmail: (name, email, phone, subject, message) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@nexurasolutions.com';
    const emailSubject = `📩 New Contact: ${subject}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="background:#0f172a;padding:24px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">📬 New Contact Form Submission</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb">
          <div style="background:#fff;border:1px solid #d1d5db;border-radius:6px;padding:16px;margin:0 0 20px 0">
            <p style="margin:0 0 8px 0"><strong>Name:</strong> ${name}</p>
            <p style="margin:0 0 8px 0"><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p style="margin:0 0 8px 0"><strong>Phone:</strong> ${phone || 'Not provided'}</p>
            <p style="margin:0 0 8px 0"><strong>Subject:</strong> ${subject}</p>
          </div>
          <p style="margin:0 0 8px 0"><strong>Message:</strong></p>
          <div style="background:#fff;border:1px solid #d1d5db;border-radius:6px;padding:16px;white-space:pre-wrap">${message}</div>
          <br/>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin"
             style="display:inline-block;background:#0f172a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
            Go to Admin Portal →
          </a>
          <br/><br/>
          <p style="color:#6b7280;font-size:13px">Nexura Solutions · noreply@nexurasolutions.com</p>
        </div>
      </div>`;
    return sendEmail({ to: adminEmail, subject: emailSubject, html });
  },

  // 6. Auto-reply email to user after contact form submission
  sendAutoReplyEmail: (email, name) => {
    const subject = 'Thank you for contacting Nexura Solutions! 📩';
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="background:#0f172a;padding:24px;border-radius:8px 8px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px">We've Received Your Message!</h1>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;line-height:1.6">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for reaching out to <strong>Nexura Solutions</strong>. We have successfully received your inquiry and our team is already reviewing it.</p>
          <p>One of our experts will get back to you within 24-48 business hours.</p>
          <div style="background:#fff;border-left:4px solid #3b82f6;padding:16px;margin:24px 0;font-style:italic;color:#4b5563">
            "We are committed to delivering exceptional digital solutions and we're excited to learn more about how we can help your business grow."
          </div>
          <p>In the meantime, feel free to explore our latest projects and insights:</p>
          <div style="margin-top:20px">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/portfolio" 
               style="display:inline-block;background:#3b82f6;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold;margin-right:10px">
               View Portfolio
            </a>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/blog" 
               style="display:inline-block;background:#fff;border:1px solid #d1d5db;color:#374151;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold">
               Read Our Blog
            </a>
          </div>
          <br/>
          <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0" />
          <p style="color:#6b7280;font-size:13px;text-align:center">
            Nexura Solutions · Innovation. Excellence. Digital Growth.<br/>
            <a href="mailto:support@nexurasolutions.com" style="color:#3b82f6;text-decoration:none">support@nexurasolutions.com</a>
          </p>
        </div>
      </div>`;
    return sendEmail({ to: email, subject, html });
  },

  // 7. Job Application notification to admin
  sendJobApplicationEmail: (applicationData, jobTitle) => {
    const adminEmail = process.env.ADMIN_EMAIL || 'hr@nexurasolutions.com';
    const subject = `📄 New Application: ${applicationData.firstName} ${applicationData.lastName} for ${jobTitle}`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="background:#4f46e5;padding:24px;border-radius:8px 8px 0 0">
          <h1 style="color:#fff;margin:0;font-size:22px">💼 New Job Application</h1>
        </div>
        <div style="background:#f9fafb;padding:24px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb">
          <p>A new candidate has applied for the <strong>${jobTitle}</strong> position.</p>
          <div style="background:#fff;border:1px solid #d1d5db;border-radius:6px;padding:16px;margin:20px 0">
            <p style="margin:0 0 8px 0"><strong>Candidate:</strong> ${applicationData.firstName} ${applicationData.lastName}</p>
            <p style="margin:0 0 8px 0"><strong>Email:</strong> ${applicationData.email}</p>
            <p style="margin:0 0 8px 0"><strong>Phone:</strong> ${applicationData.phone}</p>
            <p style="margin:0 0 8px 0"><strong>Experience:</strong> ${applicationData.experience}</p>
            <p style="margin:0"><strong>Location:</strong> ${applicationData.location || 'N/A'}</p>
          </div>
          <p><strong>Cover Letter Excerpt:</strong></p>
          <div style="background:#fff;border:1px solid #d1d5db;border-radius:6px;padding:16px;font-style:italic">
            ${applicationData.coverLetter ? applicationData.coverLetter.substring(0, 300) + '...' : 'No cover letter provided.'}
          </div>
          <br/>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/jobs"
             style="display:inline-block;background:#4f46e5;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:bold">
            Review Application →
          </a>
          <br/><br/>
          <p style="color:#6b7280;font-size:13px">Nexura Solutions HR Portal · noreply@nexurasolutions.com</p>
        </div>
      </div>`;
    return sendEmail({ to: adminEmail, subject, html });
  },

  // 8. Auto-reply to applicant
  sendJobApplicationAutoReplyEmail: (email, firstName, jobTitle) => {
    const subject = `Application Received: ${jobTitle} at Nexura Solutions`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#333">
        <div style="background:#4f46e5;padding:24px;border-radius:8px 8px 0 0;text-align:center">
          <h1 style="color:#fff;margin:0;font-size:24px">Application Received!</h1>
        </div>
        <div style="background:#f9fafb;padding:32px;border-radius:0 0 8px 8px;border:1px solid #e5e7eb;line-height:1.6">
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>Thank you for applying for the <strong>${jobTitle}</strong> position at <strong>Nexura Solutions</strong>.</p>
          <p>We've received your application and resume. Our hiring team will review your qualifications and experience. If your profile matches our requirements, we'll reach out to schedule an interview.</p>
          <div style="background:#eef2ff;border-left:4px solid #4f46e5;padding:16px;margin:24px 0;color:#3730a3">
            Expected response time: 3-5 business days.
          </div>
          <p>We appreciate your interest in joining our team and wish you the best of luck with your application!</p>
          <br/>
          <hr style="border:0;border-top:1px solid #e5e7eb;margin:24px 0" />
          <p style="color:#6b7280;font-size:13px;text-align:center">
            Nexura Solutions · Innovation. Excellence. Digital Growth.<br/>
            <a href="https://nexurasolutions.com" style="color:#4f46e5;text-decoration:none">www.nexurasolutions.com</a>
          </p>
        </div>
      </div>`;
    return sendEmail({ to: email, subject, html });
  }
};
