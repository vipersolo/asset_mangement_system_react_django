import os
import django

# 1. Set the settings module (Ensure 'asset_management' matches your project folder name)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'asset_management.settings')
django.setup()

from django.contrib.auth import get_user_model

def setup_system():
    User = get_user_model()
    
    # 2. Define the actors with the 'role' field values
    users_to_create = [
        {
            'username': 'admin', 
            'email': 'admin@test.com', 
            'password': 'admin123', 
            'role': 'admin', 
            'is_staff': True, 
            'is_superuser': True
        },
        {
            'username': 'employee', 
            'email': 'emp@test.com', 
            'password': 'emp123', 
            'role': 'employee', 
            'is_staff': False, 
            'is_superuser': False
        },
        {
            'username': 'technician', 
            'email': 'tech@test.com', 
            'password': 'tech123', 
            'role': 'technician', 
            'is_staff': True, 
            'is_superuser': False
        },
    ]

    print("--- Starting User Setup ---")

    for u in users_to_create:
        if not User.objects.filter(username=u['username']).exists():
            if u['is_superuser']:
                # create_superuser handles staff/superuser flags automatically
                user = User.objects.create_superuser(
                    username=u['username'], 
                    email=u['email'], 
                    password=u['password'],
                    role=u['role']
                )
            else:
                # create_user for normal roles
                user = User.objects.create_user(
                    username=u['username'], 
                    email=u['email'], 
                    password=u['password'], 
                    is_staff=u['is_staff'],
                    role=u['role']
                )
            print(f"✅ Created: {u['username']} with role: {u['role']}")
        else:
            # If user exists, we update the role just in case
            user = User.objects.get(username=u['username'])
            user.role = u['role']
            user.save()
            print(f"ℹ️ User {u['username']} already exists. Role updated to: {u['role']}")

    print("--- Setup Complete ---")

if __name__ == "__main__":
    setup_system()