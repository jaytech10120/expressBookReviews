const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req,res,next){
// Authentication middleware for /customer/auth/* routes
    // Check if session exists and contains authorization info
    if (req.session && req.session.authorization) {
        const token = req.session.authorization.accessToken;

        // Verify JWT token
        jwt.verify(token, "access", (err, user) => {
            if (err) {
                // Token invalid or expired
                return res.status(403).json({ message: "User not authenticated" });
            }

            // Token is valid → attach user info to request
            req.user = user;
            next(); // proceed to the next middleware or route handler
        });
    } else {
        // No session or token → user not logged in
        return res.status(403).json({ message: "User not logged in" });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
