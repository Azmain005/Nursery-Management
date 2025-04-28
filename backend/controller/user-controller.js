import { addUser, getUserRoleByEmail, getUsers } from "../models/UserModel";

export const createUser = async (user) => {
  try {
    await addUser(user);
    console.log("User added successfully!");
  } catch (error) {
    console.error("Error adding user:", error);
  }
};

export const fetchUsers = async () => {
  try {
    const users = await getUsers();
    return users;
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
};

// Function to check email and return the role
export const fetchUserRoleByEmail = async (email) => {
  try {
    const role = await getUserRoleByEmail(email);
    return role;
  } catch (error) {
    console.error("Error fetching user role by email:", error);
    return null;
  }
};