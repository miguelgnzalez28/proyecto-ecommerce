// Example: How to use Vercel Blob Storage for storing data
// This is useful for storing JSON files, images, or other binary data

import { put, get, del, list } from '@vercel/blob';

// Store email data as JSON
export async function storeEmailInBlob(email, userData) {
  try {
    const data = {
      email,
      ...userData,
      createdAt: new Date().toISOString(),
    };
    
    const filename = `emails/${email.replace('@', '_at_')}.json`;
    const { url } = await put(filename, JSON.stringify(data), {
      access: 'public',
      contentType: 'application/json',
    });
    
    return { success: true, url };
  } catch (error) {
    console.error('Error storing email in blob:', error);
    return { success: false, error: error.message };
  }
}

// Get email data from blob
export async function getEmailFromBlob(email) {
  try {
    const filename = `emails/${email.replace('@', '_at_')}.json`;
    const blob = await get(filename);
    const text = await blob.text();
    return JSON.parse(text);
  } catch (error) {
    console.error('Error getting email from blob:', error);
    return null;
  }
}

// List all emails
export async function listAllEmails() {
  try {
    const { blobs } = await list({ prefix: 'emails/' });
    const emails = [];
    
    for (const blob of blobs) {
      const data = await get(blob.url);
      const text = await data.text();
      emails.push(JSON.parse(text));
    }
    
    return emails;
  } catch (error) {
    console.error('Error listing emails:', error);
    return [];
  }
}
