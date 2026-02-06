const express = require('express');
const crypto = require('crypto');
const { auth, requireOrgAdmin } = require('../middleware/auth');
const prisma = require('../prisma');

const router = express.Router();

// Create organization
router.post('/', auth, async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Organization name required' });
        }

        if (req.user.orgId) {
            return res.status(400).json({ error: 'Already in an organization' });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const org = await prisma.organization.create({
            data: { name, slug: `${slug}-${Date.now().toString(36)}` }
        });

        await prisma.user.update({
            where: { id: req.user.id },
            data: { orgId: org.id, role: 'OWNER' }
        });

        res.status(201).json({ org });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create organization' });
    }
});

// Get organization details
router.get('/', auth, async (req, res) => {
    if (!req.user.orgId) {
        return res.status(404).json({ error: 'Not in an organization' });
    }

    const org = await prisma.organization.findUnique({
        where: { id: req.user.orgId },
        include: {
            members: { select: { id: true, email: true, name: true, role: true } },
            _count: { select: { slangs: true, templates: true } }
        }
    });

    res.json({ org });
});

// Invite member
router.post('/invite', auth, requireOrgAdmin, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email required' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await prisma.invitation.create({
            data: {
                orgId: req.user.orgId,
                email,
                invitedBy: req.user.id,
                token,
                expiresAt
            }
        });

        res.json({
            message: 'Invitation created',
            inviteLink: `/join?token=${token}`
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create invitation' });
    }
});

// Accept invitation
router.post('/join', auth, async (req, res) => {
    try {
        const { token } = req.body;

        const invitation = await prisma.invitation.findUnique({
            where: { token },
            include: { org: true }
        });

        if (!invitation || invitation.expiresAt < new Date()) {
            return res.status(400).json({ error: 'Invalid or expired invitation' });
        }

        if (req.user.orgId) {
            return res.status(400).json({ error: 'Already in an organization' });
        }

        await prisma.user.update({
            where: { id: req.user.id },
            data: { orgId: invitation.orgId, role: 'MEMBER' }
        });

        await prisma.invitation.delete({ where: { id: invitation.id } });

        res.json({ message: 'Joined organization', org: invitation.org });
    } catch (error) {
        res.status(500).json({ error: 'Failed to join organization' });
    }
});

// Update member role
router.patch('/members/:userId/role', auth, requireOrgAdmin, async (req, res) => {
    try {
        const { userId } = req.params;
        const { role } = req.body;

        if (!['ADMIN', 'MEMBER'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const member = await prisma.user.findFirst({
            where: { id: userId, orgId: req.user.orgId }
        });

        if (!member) {
            return res.status(404).json({ error: 'Member not found' });
        }

        if (member.role === 'OWNER') {
            return res.status(403).json({ error: 'Cannot change owner role' });
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: { role }
        });

        res.json({ user: { id: updated.id, email: updated.email, role: updated.role } });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update role' });
    }
});

// Remove member
router.delete('/members/:userId', auth, requireOrgAdmin, async (req, res) => {
    try {
        const { userId } = req.params;

        const member = await prisma.user.findFirst({
            where: { id: userId, orgId: req.user.orgId }
        });

        if (!member || member.role === 'OWNER') {
            return res.status(403).json({ error: 'Cannot remove this member' });
        }

        await prisma.user.update({
            where: { id: userId },
            data: { orgId: null, role: 'MEMBER' }
        });

        res.json({ message: 'Member removed' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove member' });
    }
});

module.exports = router;
