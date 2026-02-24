const requireRoles = (allowedRoles = []) => {
    return (req, res, next) => {
        const role = req.user?.role;

        if (!role) {
            return res.status(403).json({ message: "Accès refusé : rôle manquant" });
        }

        if (!allowedRoles.includes(role)) {
            return res.status(403).json({
                message: "Accès refusé : rôle insuffisant",
                role,
                allowedRoles
            });
        }

        next();
    };
};

export default requireRoles;
