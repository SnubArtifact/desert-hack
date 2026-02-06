const express = require('express');
const { auth, requireOrgAdmin } = require('../middleware/auth');
const prisma = require('../prisma');

const router = express.Router();

// Get all templates
router.get('/', auth, async (req, res) => {
    if (!req.user.orgId) {
        return res.json({ templates: [] });
    }

    const templates = await prisma.template.findMany({
        where: { orgId: req.user.orgId },
        orderBy: { createdAt: 'desc' }
    });

    res.json({ templates });
});

// Create template
router.post('/', auth, requireOrgAdmin, async (req, res) => {
    try {
        const { name, content, channel = 'EMAIL' } = req.body;

        if (!name?.trim() || !content?.trim()) {
            return res.status(400).json({ error: 'Name and content required' });
        }

        const template = await prisma.template.create({
            data: {
                orgId: req.user.orgId,
                name: name.trim(),
                content: content.trim(),
                channel
            }
        });

        res.status(201).json({ template });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create template' });
    }
});

// Update template
router.patch('/:id', auth, requireOrgAdmin, async (req, res) => {
    try {
        const { name, content, channel } = req.body;

        const template = await prisma.template.update({
            where: { id: req.params.id },
            data: {
                ...(name && { name: name.trim() }),
                ...(content && { content: content.trim() }),
                ...(channel && { channel })
            }
        });

        res.json({ template });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update template' });
    }
});

// Delete template
router.delete('/:id', auth, requireOrgAdmin, async (req, res) => {
    try {
        await prisma.template.delete({ where: { id: req.params.id } });
        res.json({ message: 'Template deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete template' });
    }
});

module.exports = router;
