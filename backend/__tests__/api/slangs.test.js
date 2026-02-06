const request = require('supertest');
const app = require('../../src/app');

describe('Slangs API', () => {
    let token;
    let orgOwnerToken;

    beforeEach(async () => {
        // Create user without org
        const user = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'slanguser@example.com',
                password: 'password123'
            });
        token = user.body.token;

        // Create user with org (owner)
        const owner = await request(app)
            .post('/api/auth/register')
            .send({
                email: 'orgowner@example.com',
                password: 'password123'
            });
        orgOwnerToken = owner.body.token;

        await request(app)
            .post('/api/org')
            .set('Authorization', `Bearer ${orgOwnerToken}`)
            .send({ name: 'Slang Test Org' });
    });

    describe('GET /api/slangs', () => {
        it('should return empty slangs for new user', async () => {
            const res = await request(app)
                .get('/api/slangs')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.personal).toEqual([]);
        });

        it('should return org slangs for org member', async () => {
            // Add org slang first
            await request(app)
                .post('/api/slangs/org')
                .set('Authorization', `Bearer ${orgOwnerToken}`)
                .send({ slang: 'jugaad', meaning: 'creative solution' });

            const res = await request(app)
                .get('/api/slangs')
                .set('Authorization', `Bearer ${orgOwnerToken}`);

            expect(res.status).toBe(200);
            expect(res.body.org).toBeDefined();
        });
    });

    describe('Personal Slangs', () => {
        describe('POST /api/slangs/personal', () => {
            it('should add personal slang', async () => {
                const res = await request(app)
                    .post('/api/slangs/personal')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        slang: 'yaar',
                        meaning: 'friend'
                    });

                expect(res.status).toBe(201);
                expect(res.body.slang.slang).toBe('yaar');
                expect(res.body.slang.meaning).toBe('friend');
            });

            it('should reject empty slang', async () => {
                const res = await request(app)
                    .post('/api/slangs/personal')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        slang: '',
                        meaning: 'something'
                    });

                expect(res.status).toBe(400);
            });

            it('should reject empty meaning', async () => {
                const res = await request(app)
                    .post('/api/slangs/personal')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        slang: 'test',
                        meaning: ''
                    });

                expect(res.status).toBe(400);
            });

            it('should reject duplicate slang', async () => {
                await request(app)
                    .post('/api/slangs/personal')
                    .set('Authorization', `Bearer ${token}`)
                    .send({ slang: 'duplicate', meaning: 'first' });

                const res = await request(app)
                    .post('/api/slangs/personal')
                    .set('Authorization', `Bearer ${token}`)
                    .send({ slang: 'duplicate', meaning: 'second' });

                expect(res.status).toBe(400);
            });
        });

        describe('DELETE /api/slangs/personal/:id', () => {
            it('should delete own personal slang', async () => {
                const created = await request(app)
                    .post('/api/slangs/personal')
                    .set('Authorization', `Bearer ${token}`)
                    .send({ slang: 'todelete', meaning: 'will be deleted' });

                const res = await request(app)
                    .delete(`/api/slangs/personal/${created.body.slang.id}`)
                    .set('Authorization', `Bearer ${token}`);

                expect(res.status).toBe(200);
            });
        });
    });

    describe('Organization Slangs', () => {
        describe('GET /api/slangs/org', () => {
            it('should return org slangs for member', async () => {
                const res = await request(app)
                    .get('/api/slangs/org')
                    .set('Authorization', `Bearer ${orgOwnerToken}`);

                expect(res.status).toBe(200);
                expect(res.body.slangs).toBeDefined();
            });

            it('should return 404 for user without org', async () => {
                const res = await request(app)
                    .get('/api/slangs/org')
                    .set('Authorization', `Bearer ${token}`);

                expect(res.status).toBe(404);
            });
        });

        describe('POST /api/slangs/org', () => {
            it('should add org slang as owner', async () => {
                const res = await request(app)
                    .post('/api/slangs/org')
                    .set('Authorization', `Bearer ${orgOwnerToken}`)
                    .send({
                        slang: 'fundae',
                        meaning: 'fundamentals'
                    });

                expect(res.status).toBe(201);
                expect(res.body.slang.slang).toBe('fundae');
            });

            it('should reject org slang from user without org', async () => {
                const res = await request(app)
                    .post('/api/slangs/org')
                    .set('Authorization', `Bearer ${token}`)
                    .send({
                        slang: 'test',
                        meaning: 'test'
                    });

                expect(res.status).toBe(403);
            });
        });

        describe('PATCH /api/slangs/org/:id/approve', () => {
            let slangId;

            beforeEach(async () => {
                const created = await request(app)
                    .post('/api/slangs/org')
                    .set('Authorization', `Bearer ${orgOwnerToken}`)
                    .send({ slang: 'pending', meaning: 'pending slang' });
                slangId = created.body.slang.id;
            });

            it('should approve slang as admin', async () => {
                const res = await request(app)
                    .patch(`/api/slangs/org/${slangId}/approve`)
                    .set('Authorization', `Bearer ${orgOwnerToken}`);

                expect(res.status).toBe(200);
                expect(res.body.slang.isApproved).toBe(true);
            });
        });

        describe('DELETE /api/slangs/org/:id', () => {
            let slangId;

            beforeEach(async () => {
                const created = await request(app)
                    .post('/api/slangs/org')
                    .set('Authorization', `Bearer ${orgOwnerToken}`)
                    .send({ slang: 'todelete', meaning: 'org slang' });
                slangId = created.body.slang.id;
            });

            it('should delete org slang as owner', async () => {
                const res = await request(app)
                    .delete(`/api/slangs/org/${slangId}`)
                    .set('Authorization', `Bearer ${orgOwnerToken}`);

                expect(res.status).toBe(200);
            });
        });
    });

    describe('GET /api/slangs/prompt', () => {
        it('should return prompt format', async () => {
            // Add a slang first
            await request(app)
                .post('/api/slangs/personal')
                .set('Authorization', `Bearer ${token}`)
                .send({ slang: 'yaar', meaning: 'friend' });

            const res = await request(app)
                .get('/api/slangs/prompt')
                .set('Authorization', `Bearer ${token}`);

            expect(res.status).toBe(200);
            expect(res.body.prompt).toBeDefined();
        });
    });
});
