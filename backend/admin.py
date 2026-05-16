from backend.db import init_db
import asyncio
from models.users import User, RoleType, BlockType
from utils.security import hash_password, verify_password
from dotenv import load_dotenv
import getpass
import os

load_dotenv()
admin_pass = os.getenv("ADMIN_CODE")
admin_email = os.getenv("ADMIN_EMAIL")

async def create_admin():   
    await init_db()

    existing_admin = await User.find_one(User.email == admin_email)
    if existing_admin:
        print("Admin user already exists.")
        return

    secret = getpass.getpass("Enter admin password: ")
    if secret != admin_pass:
        print("Unauthorized.")
        return

    admin = User(
        fname = "Admin",
        lname = "User",
        email = admin_email,
        password = hash_password(admin_pass),
        staff_id = "admin001",
        block = BlockType.A,
        role = RoleType.admin,
        )
    await admin.insert()
    print("Admin user created successfully")


async def change_password():
    await init_db()

    existing_admin = await User.find_one(User.email == admin_email) #fetching the admin user from the database using the email address
    if not existing_admin:
        print("Admin does not exist.")
        return
    
    current_password = getpass.getpass("Enter admin password:") #prompting the user to enter the current password
    if not verify_password(current_password, existing_admin.password):
        print("Unauthorized.")
        return
    
    new_password = getpass.getpass("Enter new password")
    confirm_password = getpass.getpass("Confirm password")
    if new_password != confirm_password:
        print("Passwords do not match")
        return
    
    if len(new_password) < 6:
        print("Password must be at least 6 characters long")
        return 
    
    existing_admin.password = hash_password(new_password)
    await existing_admin.save()
    print("Admin password updated successfully")


async def main():
    print("1. Create admin user")
    print("2. Change admin password")
    choice = input("Enter your choice (1 or 2): ")
    if choice == "1":
        await create_admin()
    elif choice == "2":
        await change_password()
    else:
        print("Invalid choice")
asyncio.run(main())