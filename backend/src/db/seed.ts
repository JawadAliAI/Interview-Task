import db from './client';

const snippets = [
  {
    title: 'Refund - 14-day window',
    category: 'refunds',
    tags: JSON.stringify(['refund', 'return', 'money back']),
    body: `Customers may request a full refund within 14 days of purchase, no questions asked. To initiate a refund: (1) Log into your account and navigate to Order History. (2) Select the order and click "Request Refund". (3) Choose your refund reason and submit. Refunds are processed within 5–7 business days back to the original payment method. After 14 days, refunds are considered on a case-by-case basis at our discretion depending on the situation and product condition.`,
  },
  {
    title: 'Double charge resolution',
    category: 'billing',
    tags: JSON.stringify(['double charge', 'duplicate', 'billing', 'charged twice']),
    body: `If you see two identical charges, please check your bank statement carefully. In many cases, one charge is a temporary authorization hold that will automatically drop off within 3–5 business days — it is not an actual debit. To verify: (1) Check your bank or card statement for "pending" vs "posted" transactions. (2) If both charges are posted after 5 business days, contact our billing team with your order number and we will issue an immediate refund for the duplicate. (3) We will also provide a confirmation email once resolved.`,
  },
  {
    title: 'Password reset steps',
    category: 'account',
    tags: JSON.stringify(['password', 'reset', 'login', 'access']),
    body: `To reset your password: (1) Visit our login page and click "Forgot Password" below the sign-in form. (2) Enter the email address associated with your account and click "Send Reset Link". (3) Check your inbox — including your spam or junk folder — for an email from us. (4) Click the reset link in the email (it expires in 1 hour). (5) Enter and confirm your new password, then save. If you do not receive the email within 5 minutes, try resending or contact support.`,
  },
  {
    title: 'Tone - calm and concise',
    category: 'tone',
    tags: JSON.stringify(['tone', 'style', 'communication']),
    body: `Always acknowledge the customer's frustration or concern first before moving to resolution steps. Use plain, everyday language — avoid technical jargon, internal terms, or overly formal phrasing. Keep replies under 150 words unless the issue requires technical detail. Be warm and empathetic without being overly apologetic. Sign off warmly with something like "Please let us know if there's anything else we can help with." Never be dismissive or make the customer feel at fault.`,
  },
  {
    title: 'Order not received',
    category: 'shipping',
    tags: JSON.stringify(['shipping', 'delivery', 'order', 'not received', 'lost']),
    body: `If your order has not arrived: (1) Check the tracking link in your shipping confirmation email for the latest status. (2) Allow up to 2 additional business days beyond the estimated delivery date, as carriers sometimes run late. (3) If the tracking shows "delivered" but you have not received it, check with neighbors and building management. (4) If the item is still missing after 2 extra business days, contact us — we will initiate a carrier trace investigation. (5) Once the trace is complete, we will offer a reship or full refund based on the outcome.`,
  },
  {
    title: 'Account cancellation policy',
    category: 'account',
    tags: JSON.stringify(['cancel', 'cancellation', 'close account', 'unsubscribe']),
    body: `You can cancel your subscription at any time — no cancellation fees apply. To cancel: (1) Log into your account and go to Settings > Account > Cancel Subscription. (2) Follow the on-screen prompts to confirm cancellation. (3) Your access continues until the end of the current billing period. (4) Your data is retained for 30 days after cancellation, after which it is permanently deleted. If you'd prefer to take a break instead of fully cancelling, we also offer the option to pause your subscription for up to 3 months from the same settings page.`,
  },
];

const count = (db.prepare('SELECT COUNT(*) as cnt FROM snippets').get() as { cnt: number }).cnt;

if (count === 0) {
  const insert = db.prepare(
    'INSERT INTO snippets (title, category, tags, body) VALUES (@title, @category, @tags, @body)',
  );

  const insertMany = db.transaction((rows: typeof snippets) => {
    for (const row of rows) {
      insert.run(row);
    }
  });

  insertMany(snippets);
  console.log(`Seeded ${snippets.length} snippets.`);
} else {
  console.log(`Snippets table already has ${count} rows — skipping seed.`);
}

db.close();
