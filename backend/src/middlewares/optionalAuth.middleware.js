import jwt from "jsonwebtoken";

const optionalAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return next();

    const token = authHeader.split(" ")[1];
    if (!token) return next();

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        // token invalide => on ignore et on continue en mode public
    }

    next();
};

export default optionalAuth;
