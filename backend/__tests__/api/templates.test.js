const request = require('supertest');
const app = require('../../src/app');

describe('Templates API', () => {
    let ownerToken;
    let memberToken;

    beforeEach(async () => {
        // Create owner with org
        const owner = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'templateowner@example.com',
                password: 'password123'
            });
        ownerToken = owner.body.token;

        await request(app)
            .post('/api/org')
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({ name: 'Template Test Org' });

        // Create and add member
        const member = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'templatemember@example.com',
                password: 'password123'
            });
        memberToken = member.body.token;

        const invite = await request(app)
            .post('/api/org/invite')
            .set('Authorization', `Bearer ${ownerToken}`)
            .send({ email: 'templatemember@example.com' });

        const inviteToken = invite.body.inviteLink.split('token=')[1];

        await request(app)
            .post('/api/org/join')
            .set('Authorization', `Bearer ${memberToken}`)
            .send({ token: inviteToken });
    });

    describe('POST /api/templates', () => {
        it('should create template as org owner', async () => {
            const res = await request(app)
                .post('/api/templates')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    name: 'Meeting Invite',
                    content: 'Dear {name}, Please join the meeting on {date}.',
                    channel: 'EMAIL'
                });

            expect(res.status).toBe(201);
            expect(res.body.template.name).toBe('Meeting Invite');
            expect(res.body.template.channel).toBe('EMAIL');
        });

        it('should reject template without name', async () => {
            const res = await request(app)
                .post('/api/templates')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    content: 'Some content',
                    channel: 'EMAIL'
                });

            expect(res.status).toBe(400);
        });

        it('should reject template without content', async () => {
            const res = await request(app)
                .post('/api/templates')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    name: 'Empty Template',
                    channel: 'EMAIL'
                });

            expect(res.status).toBe(400);
        });

        it('should default channel to EMAIL', async () => {
            const res = await request(app)
                .post('/api/templates')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    name: 'Default Channel',
                    content: 'Some content'
                });

            expect(res.status).toBe(201);
            expect(res.body.template.channel).toBe('EMAIL');
        });

        it('should accept WHATSAPP channel', async () => {
            const res = await request(app)
                .post('/api/templates')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    name: 'WhatsApp Template',
                    content: 'Quick message',
                    channel: 'WHATSAPP'
                });

            expect(res.status).toBe(201);
            expect(res.body.template.channel).toBe('WHATSAPP');
        });

        it('should accept LINKEDIN channel', async () => {
            const res = await request(app)
                .post('/api/templates')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    name: 'LinkedIn Post',
                    content: 'Professional update',
                    channel: 'LINKEDIN'
                });

            expect(res.status).toBe(201);
            expect(res.body.template.channel).toBe('LINKEDIN');
        });
    });

    describe('GET /api/templates', () => {
        beforeEach(async () => {
            // Create some templates
            await request(app)
                .post('/api/templates')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    name: 'Template 1',
                    content: 'Content 1',
                    channel: 'EMAIL'
                });

            await request(app)
                .post('/api/templates')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    name: 'Template 2',
                    content: 'Content 2',
                    channel: 'WHATSAPP'
                });
        });

        it('should return all org templates for owner', async () => {
            const res = await request(app)
                .get('/api/templates')
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.templates.length).toBe(2);
        });

        it('should return all org templates for member', async () => {
            const res = await request(app)
                .get('/api/templates')
                .set('Authorization', `Bearer ${memberToken}`);

            expect(res.status).toBe(200);
            expect(res.body.templates.length).toBe(2);
        });

        it('should return empty array for user without org', async () => {
            const noOrg = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'noorg@example.com',
                    password: 'password123'
                });

            const res = await request(app)
                .get('/api/templates')
                .set('Authorization', `Bearer ${noOrg.body.token}`);

            expect(res.status).toBe(200);
            expect(res.body.templates).toEqual([]);
        });
    });

    describe('PATCH /api/templates/:id', () => {
        let templateId;

        beforeEach(async () => {
            const template = await request(app)
                .post('/api/templates')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    name: 'Original Template',
                    content: 'Original content',
                    channel: 'EMAIL'
                });
            templateId = template.body.template.id;
        });

        it('should update template name', async () => {
            const res = await request(app)
                .patch(`/api/templates/${templateId}`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ name: 'Updated Name' });

            expect(res.status).toBe(200);
            expect(res.body.template.name).toBe('Updated Name');
        });

        it('should update template content', async () => {
            const res = await request(app)
                .patch(`/api/templates/${templateId}`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ content: 'Updated content' });

            expect(res.status).toBe(200);
            expect(res.body.template.content).toBe('Updated content');
        });

        it('should update template channel', async () => {
            const res = await request(app)
                .patch(`/api/templates/${templateId}`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ channel: 'LINKEDIN' });

            expect(res.status).toBe(200);
            expect(res.body.template.channel).toBe('LINKEDIN');
        });
    });

    describe('DELETE /api/templates/:id', () => {
        let templateId;

        beforeEach(async () => {
            const template = await request(app)
                .post('/api/templates')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({
                    name: 'To Delete',
                    content: 'Will be deleted',
                    channel: 'EMAIL'
                });
            templateId = template.body.template.id;
        });

        it('should delete template as owner', async () => {
            const res = await request(app)
                .delete(`/api/templates/${templateId}`)
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(res.status).toBe(200);

            // Verify deletion
            const list = await request(app)
                .get('/api/templates')
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(list.body.templates.length).toBe(0);
        });
    });
});
