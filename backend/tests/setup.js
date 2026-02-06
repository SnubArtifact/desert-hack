require('dotenv').config();
const prisma = require('../src/prisma');

// Clean up database before tests
beforeAll(async () => {
    // Ensure clean state
    try {
        await prisma.$connect();
    } catch (e) {
        console.error('Failed to connect to test database:', e);
        process.exit(1);
    }
});

// Clean up specific tables before each test suite
beforeEach(async () => {
    // Delete in order due to foreign keys
    await prisma.template.deleteMany();
    await prisma.orgSlang.deleteMany();
    await prisma.personalSlang.deleteMany();
    await prisma.invitation.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();
});

// Disconnect after all tests
afterAll(async () => {
    await prisma.$disconnect();
});

// Export for use in tests
global.prisma = prisma;
