import IdGenerator from "../utils/idGenerator.js";

let users;

export default class UserDAO {
    static async injectDB(conn) {
        if (users) {
            return;
        }
        try {
            users = await conn.db("inventory").collection("users");

            // unique index on email
            await users.createIndex({ email: 1 }, { unique: true });
        } catch (e) {
            console.error(`Unable to establish connection handle for users: ${e}`);
        }
    }

    static async createUser(userData) {
        try {
            const customId = IdGenerator.generateId();
            const userDoc = {
                _id: customId,
                customId: customId, // Store custom ID for easy access
                name: userData.name,
                email: userData.email,
                password: userData.password, // This should be hashed before calling this method
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await users.insertOne(userDoc);
            console.log(result);
            return { insertedId: customId, ...userDoc };
        } catch (e) {
            if (e.code === 11000) {
                return { error: "User with this email already exists" };
            }
            console.error(`Unable to create user: ${e}`);
            return { error: e.message };
        }
    }

    static async getUserByEmail(email) {
        try {
            const user = await users.findOne({ email: email });
            console.log(user);
            return user;
        } catch (e) {
            console.error(`Unable to get user by email: ${e}`);
            return { error: e.message };
        }
    }

    static async getUserById(userId) {
        try {
            const user = await users.findOne({ _id: userId.toString() });
            console.log("This is user",user);
            return user;
        } catch (e) {
            console.error(`Unable to get user by ID: ${e}`);
            return { error: e.message };
        }
    }

    static async updateUser(userId, updateData) {
        try {
            const updateDoc = {
                ...updateData,
                updatedAt: new Date()
            };

            const result = await users.updateOne(
                { _id: userId.toString() },
                { $set: updateDoc }
            );

            return result;
        } catch (e) {
            console.error(`Unable to update user: ${e}`);
            return { error: e.message };
        }
    }

    static async deleteUser(userId) {
        try {
            const result = await users.deleteOne({ _id: userId.toString() });
            return result;
        } catch (e) {
            console.error(`Unable to delete user: ${e}`);
            return { error: e.message };
        }
    }

    static async updateLastLogin(userId) {
        console.log(userId);
        try {
            const result = await users.updateOne(
                { _id: userId.toString() },
                {
                    $set: {
                        lastLogin: new Date(),
                        updatedAt: new Date()
                    }
                }
            );
            return result;
        } catch (e) {
            console.error(`Unable to update last login: ${e}`);
            return { error: e.message };
        }
    }
}