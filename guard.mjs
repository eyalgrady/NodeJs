import jwt from "jsonwebtoken";

export const guard = (req,res,next) => {
    jwt.verify(req.headers.authorization, process.env.JWT_SECRET, (err, data) => {
        if(err) {
            res.status(401).send('User not authorized');
        } else {
            next();
        }
    });
}

export const roleGuard = (req,res,next) => {
    const user = getUser(req);
    
    if (user?.isBusiness || user?.isAdmin) {
        next();
    } else {
        res.status(401).send('User is not authorized');
    }
}

export const adminGuard = (req,res,next) => {
    const user = getUser(req);
    
    if (user?.isAdmin) {
        next();
    } else {
        res.status(401).send('User is not authorized');
    }
}

export const getUser = (req, res) => {
    if (!req.headers.authorization) {
        return null;
    }

    const user = jwt.decode(req.headers.authorization, process.env.JWT_SECRET);

    if (!user) {
        return null;
    }

    return user;
}