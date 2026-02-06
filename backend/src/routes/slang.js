const express = require('express');
const { auth, requireOrgAdmin } = require('../middleware/auth');
const prisma = require('../prisma');

const router = express.Router();

// Get all slangs (personal + org)
router.get('/', auth, async (req, res) => {
    try {
        const personal = await prisma.personalSlang.findMany({
            where: { userId: req.user.id }
        });

        let org = [];
        if (req.user.orgId) {
            org = await prisma.orgSlang.findMany({
                where: { orgId: req.user.orgId, isApproved: true }
            });
        }

        res.json({
            personal: personal.map(s => ({ id: s.id, slang: s.slang, meaning: s.meaning })),
            org: org.map(s => ({ id: s.id, slang: s.slang, meaning: s.meaning }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch slangs' });
    }
});

// Format slangs for AI prompt
router.get('/prompt', auth, async (req, res) => {
    try {
        const personal = await prisma.personalSlang.findMany({
            where: { userId: req.user.id }
        });

        let org = [];
        if (req.user.orgId) {
            org = await prisma.orgSlang.findMany({
                where: { orgId: req.user.orgId, isApproved: true }
            });
        }

        const all = [...org, ...personal];
        if (all.length === 0) {
            return res.json({ prompt: '' });
        }

        const formatted = all.map(s => `- "${s.slang}" = ${s.meaning}`).join('\n');
        const prompt = `\n\nCustom slangs (ALWAYS use these interpretations):\n${formatted}`;

        res.json({ prompt });
    } catch (error) {
        res.status(500).json({ error: 'Failed to format slangs' });
    }
});

// Add personal slang
router.post('/personal', auth, async (req, res) => {
    try {
        const { slang, meaning } = req.body;

        if (!slang?.trim() || !meaning?.trim()) {
            return res.status(400).json({ error: 'Slang and meaning required' });
        }

        const existing = await prisma.personalSlang.findFirst({
            where: { userId: req.user.id, slang: slang.trim().toLowerCase() }
        });

        if (existing) {
            return res.status(400).json({ error: 'Slang already exists' });
        }

        const created = await prisma.personalSlang.create({
            data: {
                userId: req.user.id,
                slang: slang.trim(),
                meaning: meaning.trim()
            }
        });

        res.status(201).json({ slang: created });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add slang' });
    }
});

// Delete personal slang
router.delete('/personal/:id', auth, async (req, res) => {
    try {
        await prisma.personalSlang.deleteMany({
            where: { id: req.params.id, userId: req.user.id }
        });
        res.json({ message: 'Slang deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete slang' });
    }
});

// Add org slang (admin only)
router.post('/org', auth, requireOrgAdmin, async (req, res) => {
    try {
        const { slang, meaning, isApproved = true } = req.body;

        if (!slang?.trim() || !meaning?.trim()) {
            return res.status(400).json({ error: 'Slang and meaning required' });
        }

        const created = await prisma.orgSlang.create({
            data: {
                orgId: req.user.orgId,
                createdById: req.user.id,
                slang: slang.trim(),
                meaning: meaning.trim(),
                isApproved
            }
        });

        res.status(201).json({ slang: created });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add org slang' });
    }
});

// Get all org slangs (including pending)
router.get('/org', auth, async (req, res) => {
    if (!req.user.orgId) {
        return res.status(404).json({ error: 'Not in an organization' });
    }

    const slangs = await prisma.orgSlang.findMany({
        where: { orgId: req.user.orgId },
        include: { createdBy: { select: { name: true, email: true } } }
    });

    res.json({ slangs });
});

// Approve org slang
router.patch('/org/:id/approve', auth, requireOrgAdmin, async (req, res) => {
    try {
        const updated = await prisma.orgSlang.update({
            where: { id: req.params.id },
            data: { isApproved: true }
        });
        res.json({ slang: updated });
    } catch (error) {
        res.status(500).json({ error: 'Failed to approve slang' });
    }
});

// Delete org slang
router.delete('/org/:id', auth, requireOrgAdmin, async (req, res) => {
    try {
        await prisma.orgSlang.delete({ where: { id: req.params.id } });
        res.json({ message: 'Slang deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete slang' });
    }
});

module.exports = router;
