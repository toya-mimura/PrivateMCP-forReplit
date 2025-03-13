import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual, crypto } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, AccessToken } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Password hashing
async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Token validation
export async function validateToken(token: string): Promise<AccessToken | null> {
  const accessToken = await storage.getToken(token);
  if (!accessToken) return null;
  
  // Update last used time
  await storage.updateToken(accessToken.id, { lastUsed: new Date() });
  
  return accessToken;
}

// Create admin user on startup if it doesn't exist
async function initializeAdminUser() {
  try {
    // Check if admin user exists
    const adminUser = await storage.getUserByUsername(process.env.ADMIN_USERNAME || "admin");
    
    if (!adminUser) {
      // Create admin user with credentials from Replit Secrets
      const adminUsername = process.env.ADMIN_USERNAME || "admin";
      const adminPassword = process.env.ADMIN_PASSWORD; 
      
      // Check if password is provided
      if (!adminPassword) {
        console.error("No admin password provided in environment variables");
        return;
      } 
      
      await storage.createUser({
        username: adminUsername,
        password: await hashPassword(adminPassword),
      });
      
      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists");
    }
  } catch (error) {
    console.error("Failed to initialize admin user:", error);
  }
}

export function setupAuth(app: Express) {
  // Initialize admin user on startup
  initializeAdminUser();
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false, { message: "Invalid username or password" });
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register route - DISABLED, returns 403 Forbidden
  app.post("/api/register", async (req, res) => {
    return res.status(403).json({ message: "Registration is disabled on this server" });
  });

  // Login route
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: Error, user: SelectUser, info: any) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: info?.message || "Authentication failed" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        
        // Return user data without password
        const { password, ...userData } = user;
        res.status(200).json(userData);
      });
    })(req, res, next);
  });

  // Logout route
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get user info
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Return user data without password
    const { password, ...userData } = req.user;
    res.json(userData);
  });
}
