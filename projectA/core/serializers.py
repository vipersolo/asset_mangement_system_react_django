from rest_framework import serializers
from .models import Asset, InventoryItem, RepairTicket, Assignment, User
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role']

class AssetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Asset
        fields = '__all__'

class InventorySerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = '__all__'

class AssignmentSerializer(serializers.ModelSerializer):
    # Optional: these help you see the names in the API response 
    # instead of just ID numbers
    asset_name = serializers.ReadOnlyField(source='asset.name')
    employee_name = serializers.ReadOnlyField(source='employee.username')
    asset_details = AssetSerializer(source='asset', read_only=True)

    class Meta:
        model = Assignment
        fields = '__all__'

class RepairTicketSerializer(serializers.ModelSerializer):
    asset_name = serializers.ReadOnlyField(source='asset.name')
    technician_username = serializers.ReadOnlyField(source='technician.username')
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = RepairTicket
        fields = '__all__'

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims (these will be readable by React)
        token['username'] = user.username
        token['role'] = user.role  # This is your User model's role field
        
        return token