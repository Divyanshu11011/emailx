import { google } from 'googleapis';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });

  if (!session || !session.accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: session.accessToken });

    const gmail = google.gmail({ version: 'v1', auth });

    const maxResults = parseInt(req.query.maxResults) || 15;

    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults,
    });

    if (!response.data.messages) {
      return res.status(200).json({ emails: [] });
    }

    const emails = await Promise.all(
      response.data.messages.map(async (message) => {
        const msg = await gmail.users.messages.get({ userId: 'me', id: message.id });
        const headers = msg.data.payload.headers;
        const subject = headers.find((header) => header.name === 'Subject')?.value || 'No Subject';
        const from = headers.find((header) => header.name === 'From')?.value || 'Unknown';
        const date = headers.find((header) => header.name === 'Date')?.value || 'Unknown';
        
        let body = 'No Content';
        let attachments = [];

        const getBody = (message) => {
          let encodedBody = '';
          if (message.parts) {
            message.parts.forEach((part) => {
              if (part.mimeType === 'text/plain' && part.body.data) {
                encodedBody = part.body.data;
              } else if (part.mimeType === 'text/html' && part.body.data) {
                encodedBody = part.body.data;
              } else if (part.mimeType !== 'text/plain' && part.mimeType !== 'text/html' && part.body.attachmentId) {
                attachments.push({
                  filename: part.filename,
                  mimeType: part.mimeType,
                  size: part.body.size,
                  attachmentId: part.body.attachmentId,
                });
              }
              if (part.parts) {
                part.parts.forEach((p) => {
                  if (p.mimeType === 'text/plain' && p.body.data) {
                    encodedBody = p.body.data;
                  } else if (p.mimeType === 'text/html' && p.body.data) {
                    encodedBody = p.body.data;
                  } else if (p.mimeType !== 'text/plain' && p.mimeType !== 'text/html' && p.body.attachmentId) {
                    attachments.push({
                      filename: p.filename,
                      mimeType: p.mimeType,
                      size: p.body.size,
                      attachmentId: p.body.attachmentId,
                    });
                  }
                });
              }
            });
          } else {
            encodedBody = message.body.data;
          }
          return encodedBody ? Buffer.from(encodedBody, 'base64').toString('utf-8') : 'No Content';
        };

        body = getBody(msg.data.payload);

        return { id: message.id, subject, from, date, body, attachments };
      })
    );

    res.status(200).json({ emails });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Error fetching emails' });
  }
}
