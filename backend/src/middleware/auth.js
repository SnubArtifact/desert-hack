const jwt = require('jsonwebtoken');
const prisma = require('../prisma');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { org: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// Middleware to check if user is org admin/owner
const requireOrgAdmin = (req, res, next) => {
    if (!req.user.orgId) {
        return res.status(403).json({ error: 'Not part of an organization' });
    }
    if (!['OWNER', 'ADMIN'].includes(req.user.role)) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

module.exports = { auth, requireOrgAdmin };
