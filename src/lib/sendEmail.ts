import emailjs from "@emailjs/browser";

export async function sendApprovalEmail(values: any) {
  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID!,
      import.meta.env.VITE_EMAILJS_APPROVAL_TEMPLATE_ID!,
      values,
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY!
    );

    return true;
  } catch (err) {
    console.error("APPROVAL EMAIL FAILED:", err);
    return false;
  }
}
