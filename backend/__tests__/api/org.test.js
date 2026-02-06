const request = require('supertest');
const app = require('../../src/app');

describe('Organization API', () => {
    let token;
    let userId;

    beforeEach(async () => {
        // Create a user for org tests
        const res = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'orgtest@example.com',
                password: 'password123',
                name: 'Org Test User'
            });
        token = res.body.token;
        userId = res.body.user.id;
    });

    describe('POST /api/org', () => {
        it('should create an organization', async () => {
            const res = await request(app)
                .post('/api/org')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Test Organization' });

            expect(res.status).toBe(201);
            expect(res.body.org.name).toBe('Test Organization');
        });

        it('should reject creating org for user already in org', async () => {
            // First org creation
            await request(app)
                .post('/api/org')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'First Org' });

            // Attempt second
            const res = await request(app)
                .post('/api/org')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Second Org' });

            expect(res.status).toBe(400);
        });

        it('should reject without org name', async () => {
            const res = await request(app)
                .post('/api/org')
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(res.status).toBe(400);
        });

        it('should reject without auth', async () => {
            const res = await request(app)
                .post('/api/org')
                .send({ name: 'Unauthorized Org' });

            expect(res.status).toBe(401);
        });
    });

    describe('GET /api/org', () => {
        it('should return org details for member', async () => {
            // Create org first
            await request(app)
                .post('/api/org')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Get Org Test' });

            const res = await request(app)
                .get('/api/org')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.org.name).toBe('Get Org Test');
            expect(res.body.org.members).toBeDefined();
        });

        it('should return 404 for user without org', async () => {
            const res = await request(app)
                .get('/api/org')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(404);
        });
    });

    describe('POST /api/org/invite', () => {
        beforeEach(async () => {
            // Create org
            await request(app)
                .post('/api/org')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Invite Test Org' });
        });

        it('should create invite with valid email', async () => {
            const res = await request(app)
                .post('/api/org/invite')
                .set('Authorization', `Bearer ${token}`)
                .send({ email: 'invited@example.com' });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('inviteLink');
        });

        it('should reject invite without email', async () => {
            const res = await request(app)
                .post('/api/org/invite')
                .set('Authorization', `Bearer ${token}`)
                .send({});

            expect(res.status).toBe(400);
        });
    });

    describe('POST /api/org/join', () => {
        let inviteLink;

        beforeEach(async () => {
            // Create org and invite
            await request(app)
                .post('/api/org')
                .set('Authorization', `Bearer ${token}`)
                .send({ name: 'Join Test Org' });

            const inviteRes = await request(app)
                .post('/api/org/invite')
                .set('Authorization', `Bearer ${token}`)
                .send({ email: 'joiner@example.com' });

            inviteLink = inviteRes.body.inviteLink;
        });

        it('should join org with valid token', async () => {
            // Create new user to join
            const newUser = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'joiner@example.com',
                    password: 'password123'
                });

            // Extract token from inviteLink
            const inviteToken = inviteLink.split('token=')[1];

            const res = await request(app)
                .post('/api/org/join')
                .set('Authorization', `Bearer ${newUser.body.token}`)
                .send({ token: inviteToken });

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('org');
        });

        it('should reject invalid invite token', async () => {
            const newUser = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid@example.com',
                    password: 'password123'
                });

            const res = await request(app)
                .post('/api/org/join')
                .set('Authorization', `Bearer ${newUser.body.token}`)
                .send({ token: 'invalid-token' });

            expect(res.status).toBe(400);
        });

        it('should reject user already in org', async () => {
            const inviteToken = inviteLink.split('token=')[1];

            const res = await request(app)
                .post('/api/org/join')
                .set('Authorization', `Bearer ${token}`)
                .send({ token: inviteToken });

            expect(res.status).toBe(400);
        });
    });

    describe('Member Management', () => {
        let ownerToken;
        let memberToken;
        let memberId;

        beforeEach(async () => {
            ownerToken = token;

            // Create org
            await request(app)
                .post('/api/org')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ name: 'Member Mgmt Org' });

            // Create invite and add member
            const inviteRes = await request(app)
                .post('/api/org/invite')
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ email: 'member@example.com' });

            const memberUser = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'member@example.com',
                    password: 'password123'
                });

            memberToken = memberUser.body.token;
            memberId = memberUser.body.user.id;

            const inviteToken = inviteRes.body.inviteLink.split('token=')[1];

            await request(app)
                .post('/api/org/join')
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ token: inviteToken });
        });

        it('should allow owner to change member role', async () => {
            const res = await request(app)
                .patch(`/api/org/members/${memberId}/role`)
                .set('Authorization', `Bearer ${ownerToken}`)
                .send({ role: 'ADMIN' });

            expect(res.status).toBe(200);
        });

        it('should reject member trying to change roles', async () => {
            const res = await request(app)
                .patch(`/api/org/members/${userId}/role`)
                .set('Authorization', `Bearer ${memberToken}`)
                .send({ role: 'ADMIN' });

            expect(res.status).toBe(403);
        });

        it('should allow owner to remove member', async () => {
            const res = await request(app)
                .delete(`/api/org/members/${memberId}`)
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(res.status).toBe(200);
        });

        it('should reject removing owner', async () => {
            const res = await request(app)
                .delete(`/api/org/members/${userId}`)
                .set('Authorization', `Bearer ${ownerToken}`);

            expect(res.status).toBe(403);
        });
    });
});
