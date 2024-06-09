import OpenAI from 'openai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { emails, openAiKey } = req.body;

  if (!emails || !openAiKey) {
    return res.status(400).json({ error: 'Missing emails or OpenAI key' });
  }

  const openai = new OpenAI({
    apiKey: openAiKey,
  });

  const classifyEmail = async (email) => {
    const prompt = `
      You will be provided with an email, and your task is to classify it into one of the following categories: Important, Promotions, Social, Marketing, Spam, General.

      Example Classifications:
      Important: Emails that are personal or work-related and require immediate attention. This includes order related, security related, upcoming meetings, and deadlines.
      Promotions: Emails related to sales, discounts, and marketing campaigns.
      Social: Emails from social networks, friends, and family, or emails that include personal mentions.
      Marketing: Emails related to marketing, newsletters, and notifications.
      Spam: Unwanted or unsolicited emails, spam job posts from websites , social media notifications from unknowns or emails suggesting unwanted information unwillingly.
      General: If none of the above are matched, use General.

      Examples:
      1. Hi Emily, Thanks for your order. We are pleased to inform you that your order has been shipped. You can... (Category: Important)
      2. Dear valued customer, we are excited to introduce our latest product! Check it out on our website now. (Category: Marketing)
      3. Hello, we have important updates regarding your account security. Please review the changes in your dashboard. (Category: Important)
      4. John replied to your comment on their post (Category: Social)
      5. Get 50% off on your next purchase! (Category: Promotions)
      6. Up To ₹3,00,000 Credit Limit For you (Category: Spam)
      7. Dont miss the contest today (Category : Promotion)
      8. Checkout this post by expert suggesting how to improve lifestyle (Category: Spam)

      Email Content: ${email.textContent}

      Just return the category as a single word, no other details or explanations.

      
    `;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Classify the following email: ${email.textContent}` },
        ],
        temperature: 0.7,
        max_tokens: 64,
        top_p: 1,
      });

      return {
        ...email,
        category: response.choices[0].message.content.trim(),
      };
    } catch (error) {
      console.error(`Error classifying email with id ${email.id}:`, error);
      return {
        ...email,
        category: 'Error',
      };
    }
  };

  try {
    const classifiedEmails = [];
    for (const email of emails) {
      const classifiedEmail = await classifyEmail(email);
      classifiedEmails.push(classifiedEmail);
    }
    res.status(200).json(classifiedEmails);
  } catch (error) {
    console.error('Error classifying emails:', error);
    res.status(500).json({ error: 'Error classifying emails' });
  }
}
