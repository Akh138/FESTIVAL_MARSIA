import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
    // 1. Récupérer le header Authorization
    const authHeader = req.headers.authorization;

    // 2. Vérifier qu'il existe
    if (!authHeader) {
        return res.status(401).json({
            message: "Accès refusé : token manquant"
        });
    }

    // 3. Récupérer le token (Bearer TOKEN)
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Accès refusé : token invalide"
        });
    }

    try {
        // 4. Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 5. Stocker l'utilisateur dans la requête
        req.user = decoded;

        // 6. Continuer vers la route
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Accès refusé : token expiré ou invalide"
        });
    }
};

export default authMiddleware;
