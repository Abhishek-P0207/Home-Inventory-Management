import UserDAO from "../dao/userDAO.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default class AuthController {
    // Register new user
    static async apiRegister(req, res, next) {
        try {
            const { name, email, password } = req.body;

            // Validation
            if (!name || !email || !password) {
                return res.status(400).json({ 
                    error: "Name, email, and password are required" 
                });
            }

            if (password.length < 6) {
                return res.status(400).json({ 
                    error: "Password must be at least 6 characters long" 
                });
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ 
                    error: "Please provide a valid email address" 
                });
            }

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create user
            const userData = {
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword
            };

            const result = await UserDAO.createUser(userData);

            if (result.error) {
                return res.status(400).json({ error: result.error });
            }

            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: result.insertedId,
                    email: result.email 
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            // Return user data (without password) and token
            res.status(201).json({
                message: "User registered successfully",
                user: {
                    id: result.insertedId,
                    name: result.name,
                    email: result.email,
                    createdAt: result.createdAt
                },
                token
            });

        } catch (e) {
            console.error(`Registration error: ${e}`);
            res.status(500).json({ error: "Internal server error during registration" });
        }
    }

    // Login user
    static async apiLogin(req, res, next) {
        try {
            const { email, password } = req.body;

            // Validation
            if (!email || !password) {
                return res.status(400).json({ 
                    error: "Email and password are required" 
                });
            }

            // Find user by email
            const user = await UserDAO.getUserByEmail(email.toLowerCase().trim());
            console.log(user);
            if (!user) {
                return res.status(401).json({ 
                    error: "Invalid email or password" 
                });
            }

            // Check password
            const isPasswordValid = await bcrypt.compare(password, user.password);

            if (!isPasswordValid) {
                return res.status(401).json({ 
                    error: "Invalid email or password" 
                });
            }

            // Update last login
            await UserDAO.updateLastLogin(user._id);

            // Generate JWT token
            const token = jwt.sign(
                { 
                    userId: user._id,
                    email: user.email 
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN }
            );

            // Return user data (without password) and token
            res.json({
                message: "Login successful",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    lastLogin: new Date()
                },
                token
            });

        } catch (e) {
            console.error(`Login error: ${e}`);
            res.status(500).json({ error: "Internal server error during login" });
        }
    }

    // Get current user profile
    static async apiGetProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const user = await UserDAO.getUserById(userId);

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Return user data without password
            res.json({
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt,
                    lastLogin: user.lastLogin
                }
            });

        } catch (e) {
            console.error(`Get profile error: ${e}`);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // Update user profile
    static async apiUpdateProfile(req, res, next) {
        try {
            const userId = req.user.userId;
            const { name, email } = req.body;

            // Validation
            if (!name && !email) {
                return res.status(400).json({ 
                    error: "At least one field (name or email) is required" 
                });
            }

            const updateData = {};
            
            if (name) {
                updateData.name = name.trim();
            }

            if (email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    return res.status(400).json({ 
                        error: "Please provide a valid email address" 
                    });
                }
                updateData.email = email.toLowerCase().trim();
            }

            const result = await UserDAO.updateUser(userId, updateData);

            if (result.error) {
                return res.status(400).json({ error: result.error });
            }

            if (result.modifiedCount === 0) {
                return res.status(404).json({ error: "User not found or no changes made" });
            }

            // Get updated user data
            const updatedUser = await UserDAO.getUserById(userId);

            res.json({
                message: "Profile updated successfully",
                user: {
                    id: updatedUser._id,
                    name: updatedUser.name,
                    email: updatedUser.email,
                    updatedAt: updatedUser.updatedAt
                }
            });

        } catch (e) {
            console.error(`Update profile error: ${e}`);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // Change password
    static async apiChangePassword(req, res, next) {
        try {
            const userId = req.user.userId;
            const { currentPassword, newPassword } = req.body;

            // Validation
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ 
                    error: "Current password and new password are required" 
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({ 
                    error: "New password must be at least 6 characters long" 
                });
            }

            // Get user
            const user = await UserDAO.getUserById(userId);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isCurrentPasswordValid) {
                return res.status(401).json({ error: "Current password is incorrect" });
            }

            // Hash new password
            const saltRounds = 12;
            const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

            // Update password
            const result = await UserDAO.updateUser(userId, { password: hashedNewPassword });

            if (result.error) {
                return res.status(400).json({ error: result.error });
            }

            res.json({ message: "Password changed successfully" });

        } catch (e) {
            console.error(`Change password error: ${e}`);
            res.status(500).json({ error: "Internal server error" });
        }
    }

    // Verify token (for token validation)
    static async apiVerifyToken(req, res, next) {
        try {
            const userId = req.user.userId;
            const user = await UserDAO.getUserById(userId);

            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            res.json({
                valid: true,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email
                }
            });

        } catch (e) {
            console.error(`Verify token error: ${e}`);
            res.status(500).json({ error: "Internal server error" });
        }
    }
}