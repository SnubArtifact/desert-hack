const request = require('supertest');
const app = require('../../src/app');

describe('Integration Tests - Full User Flows', () => {
    describe('Complete Organization Setup Flow', () => {
        let ownerToken;
        let memberToken;
        let inviteLink;

        it('should complete full org setup and invite flow', async () => {
            // Step 1: Register owner
            const ownerRes = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'owner@company.com',
                    password: 'securepass123',
                    name: 'Company Owner'
                });

            expect(ownerRes.status).toBe(201);
            ownerToken = ownerRes.body.token;

            // Step 2: Create organization
            const orgRes = await request(app)
                .post('/api/org')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ name: 'Awesome Inc' });

            expect(orgRes.status).toBe(201);
            expect(orgRes.body.org.name).toBe('Awesome Inc');

            // Step 3: Create invite
            const inviteRes = await request(app)
                .post('/api/org/invite')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ email: 'member@company.com' });

            expect(inviteRes.status).toBe(200);
            inviteLink = inviteRes.body.inviteLink;

            // Step 4: Register member
            const memberRes = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'member@company.com',
                    password: 'memberpass123'
                });

            expect(memberRes.status).toBe(201);
            memberToken = memberRes.body.token;

            // Step 5: Member joins org
            const inviteToken = inviteLink.split('token=')[1];
            const joinRes = await request(app)
                .post('/api/org/join')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ token: inviteToken });

            expect(joinRes.status).toBe(200);

            // Step 6: Verify member sees org
            const meRes = await request(app)
                .get('/api/auth/me')
                .set('Authorization', `Bearer ${memberToken}`);

            expect(meRes.status).toBe(200);
            expect(meRes.body.user.org.name).toBe('Awesome Inc');
        });
    });

    describe('Complete Slangs Flow', () => {
        let adminToken;
        let memberToken;

        beforeEach(async () => {
            // Setup: Create org with owner and member
            const owner = await request(app)
                .post('/api/auth/register')
                .send({ email: 'admin@test.com', password: 'pass123' });
            adminToken = owner.body.token;

            await request(app)
                .post('/api/org')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ name: 'Slang Corp' });

            const invite = await request(app)
                .post('/api/org/invite')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ email: 'worker@test.com' });

            const member = await request(app)
                .post('/api/auth/register')
                .send({ email: 'worker@test.com', password: 'pass123' });
            memberToken = member.body.token;

            const inviteToken = invite.body.inviteLink.split('token=')[1];
            await request(app)
                .post('/api/org/join')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ token: inviteToken });
        });

        it('should allow admin to add and approve slangs', async () => {
            // Add slang
            const addRes = await request(app)
                .post('/api/slangs/org')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ slang: 'jugaad', meaning: 'creative workaround' });

            expect(addRes.status).toBe(201);
            const slangId = addRes.body.slang.id;

            // Approve slang
            const approveRes = await request(app)
                .patch(`/api/slangs/org/${slangId}/approve`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(approveRes.status).toBe(200);
            expect(approveRes.body.slang.isApproved).toBe(true);

            // Member sees approved slang
            const listRes = await request(app)
                .get('/api/slangs/org')
                .set('Authorization', `Bearer ${memberToken}`);

            expect(listRes.status).toBe(200);
            expect(listRes.body.slangs.some(s => s.slang === 'jugaad')).toBe(true);
        });

        it('should include slangs in prompt format', async () => {
            // Add and approve slang
            const addRes = await request(app)
                .post('/api/slangs/org')
                .set('Authorization', `Bearer ${adminToken}`)
                .send({ slang: 'fundae', meaning: 'fundamentals' });

            await request(app)
                .patch(`/api/slangs/org/${addRes.body.slang.id}/approve`)
                .set('Authorization', `Bearer ${adminToken}`);

            // Get prompt format
            const promptRes = await request(app)
                .get('/api/slangs/prompt')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(promptRes.status).toBe(200);
            expect(promptRes.body.prompt).toBeDefined();
        });
    });

    describe('Complete Templates Flow', () => {
        let token;

        beforeEach(async () => {
            const user = await request(app)
                .post('/api/auth/register')
                .send({ email: 'template@test.com', password: 'pass123' });
            token = user.body.token;

            await request(app)
                .post('/api/org')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Template Corp' });
        });

        it('should support full template CRUD lifecycle', async () => {
            // Create
            const createRes = await request(app)
                .post('/api/templates')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    name: 'Meeting Template',
                    content: 'Dear {name}, meeting at {time}',
                    channel: 'EMAIL'
                });

            expect(createRes.status).toBe(201);
            const templateId = createRes.body.template.id;

            // Read
            const listRes = await request(app)
                .get('/api/templates')
                .set('Authorization', `Bearer ${token}`);

            expect(listRes.body.templates.length).toBe(1);
            expect(listRes.body.templates[0].name).toBe('Meeting Template');

            // Update
            const updateRes = await request(app)
                .patch(`/api/templates/${templateId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Updated Meeting Template' });

            expect(updateRes.status).toBe(200);
            expect(updateRes.body.template.name).toBe('Updated Meeting Template');

            // Delete
            const deleteRes = await request(app)
                .delete(`/api/templates/${templateId}`)
                .set('Authorization', `Bearer ${token}`);

            expect(deleteRes.status).toBe(200);

            // Verify deleted
            const finalList = await request(app)
                .get('/api/templates')
                .set('Authorization', `Bearer ${token}`);

            expect(finalList.body.templates.length).toBe(0);
        });
    });

    describe('Permission Boundary Tests', () => {
        let orgAToken;
        let orgBToken;

        beforeEach(async () => {
            // Create two separate orgs
            const userA = await request(app)
                .post('/api/auth/register')
                .send({ email: 'userA@test.com', password: 'pass123' });
            orgAToken = userA.body.token;

            await request(app)
                .post('/api/org')
                .set('Authorization', `Bearer ${orgAToken}`)
                .send({ name: 'Org A' });

            const userB = await request(app)
                .post('/api/auth/register')
                .send({ email: 'userB@test.com', password: 'pass123' });
            orgBToken = userB.body.token;

            await request(app)
                .post('/api/org')
                .set('Authorization', `Bearer ${orgBToken}`)
                .send({ name: 'Org B' });
        });

        it('should isolate templates between orgs', async () => {
            // Create template in Org A
            await request(app)
                .post('/api/templates')
                .set('Authorization', `Bearer ${orgAToken}`)
                .send({ name: 'Secret Template', content: 'Secret', channel: 'EMAIL' });

            // Org B should not see it
            const listRes = await request(app)
                .get('/api/templates')
                .set('Authorization', `Bearer ${orgBToken}`);

            expect(listRes.body.templates.length).toBe(0);
        });

        it('should isolate slangs between orgs', async () => {
            // Create slang in Org A
            await request(app)
                .post('/api/slangs/org')
                .set('Authorization', `Bearer ${orgAToken}`)
                .send({ slang: 'secret-slang', meaning: 'secret meaning' });

            // Org B should not see it
            const listRes = await request(app)
                .get('/api/slangs/org')
                .set('Authorization', `Bearer ${orgBToken}`);

            expect(listRes.body.slangs.some(s => s.slang === 'secret-slang')).toBe(false);
        });
    });
});
