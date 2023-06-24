import axios from "axios";

const createBody = require('gmail-api-create-message-body');

export class GmailApi {
    constructor(googleClient) {
        this.googleClient = googleClient
    }

    async createDraft(subject, to, content, attachments) {
        const body = createBody({
            headers: {
                To: to,
                From: 'me',
                Subject: subject
            },
            textPlain: content,
            attachments: attachments
        });

        return await axios.post("https://gmail.googleapis.com/upload/gmail/v1/users/me/drafts", body, {
            headers: {
                Authorization: 'Bearer ' + this.getGmailAccessToken(),
                'Content-Type': 'multipart/related; boundary="foo_bar_baz"'
            }
        })
    }

    async sendDraft(draftId) {
        const body = {
            id: draftId
        }

        return await axios.post("https://gmail.googleapis.com/gmail/v1/users/me/drafts/send", body, {
            headers: {
                Authorization: 'Bearer ' + this.getGmailAccessToken()
            }
        })
    }

    getGmailAccessToken() {
        return this.googleClient.getToken().access_token
    }

}