from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response

from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.db.models import F

from .models import Asset, RepairTicket, InventoryItem, Assignment, User
from .serializers import (
    AssetSerializer,
    InventorySerializer,
    RepairTicketSerializer,
    AssignmentSerializer
)
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import MyTokenObtainPairSerializer
from .serializers import UserSerializer
from rest_framework import viewsets, permissions
from .models import User

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    # Usually, only Admins should be able to see the full user list
    permission_classes = [permissions.IsAuthenticated]

class AssetViewSet(viewsets.ModelViewSet):
    queryset = Asset.objects.all().order_by('-purchase_date')
    serializer_class = AssetSerializer
    permission_classes = [permissions.IsAuthenticated]



class InventoryViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all().order_by('item_type')
    serializer_class = InventorySerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['post'])
    def update_stock(self, request, pk=None):
        item = self.get_object()
        action_type = request.data.get('action')

        if action_type == 'add':
            item.quantity += 1
        elif action_type == 'remove' and item.quantity > 0:
            item.quantity -= 1

        item.save()
        return Response({'quantity': item.quantity})
    

class RepairTicketViewSet(viewsets.ModelViewSet):
    queryset = RepairTicket.objects.all().order_by('-id')
    serializer_class = RepairTicketSerializer
    permission_classes = [permissions.IsAuthenticated]


    def get_queryset(self):
        queryset = RepairTicket.objects.all()
        # If the user is a technician, only show tickets assigned to them
        user = self.request.user
        if user.role == 'technician':
            return queryset.filter(technician=user)
        elif user.role == 'employee':
            return RepairTicket.objects.filter(asset__assignment__employee=self.request.user).distinct()
        return queryset

    def perform_create(self, serializer):
        ticket = serializer.save(status='pending')

        # 🔥 auto update asset → repair
        asset = ticket.asset
        asset.status = 'repair'
        asset.save()

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        ticket = self.get_object()
        new_status = request.data.get('status')

        ticket.status = new_status

        if not ticket.technician:
            ticket.technician = request.user

        ticket.save()

        if new_status == 'completed':
            ticket.asset.status = 'available'
            ticket.asset.save()

        return Response({'message': 'status updated'})

    @action(detail=True, methods=['post'])
    def assign_technician(self, request, pk=None):
        ticket = self.get_object()
        tech_id = request.data.get('technician_id')

        technician = get_object_or_404(User, id=tech_id)

        ticket.technician = technician
        ticket.status = 'pending'
        ticket.save()

        return Response({'message': 'technician assigned'})
    

class AssignmentViewSet(viewsets.ModelViewSet):
    queryset = Assignment.objects.all()
    serializer_class = AssignmentSerializer
    permission_classes = [permissions.IsAuthenticated]


    def get_queryset(self):
        user = self.request.user
        if user.role == 'employee':
            # Only show assets currently in their possession
            return Assignment.objects.filter(employee=user, date_returned__isnull=True)
        return Assignment.objects.all()

    def perform_create(self, serializer):
        assignment = serializer.save()

        asset = assignment.asset
        asset.status = 'assigned'
        asset.save()

    @action(detail=True, methods=['post'])
    def return_asset(self, request, pk=None):
        assignment = self.get_object()

        assignment.date_returned = timezone.now().date()
        assignment.save()

        asset = assignment.asset
        asset.status = 'available'
        asset.save()

        return Response({'message': 'asset returned'})
    

class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Unauthorized'}, status=403)

        total_assets = Asset.objects.count()
        pending_repairs = RepairTicket.objects.filter(status='pending').count()
        low_stock = InventoryItem.objects.filter(quantity__lte=F('threshold')).count()

        status_counts = {
            'available': Asset.objects.filter(status='available').count(),
            'assigned': Asset.objects.filter(status='assigned').count(),
            'repair': Asset.objects.filter(status='repair').count(),
        }

        return Response({
            'total_assets': total_assets,
            'pending_repairs': pending_repairs,
            'low_stock': low_stock,
            'chart': status_counts
        })
    

class EmployeeDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'employee':
            return Response({'error': 'Unauthorized'}, status=403)

        assignments = Assignment.objects.filter(
            employee=request.user,
            date_returned__isnull=True
        )

        asset_ids = assignments.values_list('asset_id', flat=True)

        tickets = RepairTicket.objects.filter(
            asset_id__in=asset_ids
        ).order_by('-id')

        return Response({
            'assignments': AssignmentSerializer(assignments, many=True).data,
            'tickets': RepairTicketSerializer(tickets, many=True).data
        })
    

class TechnicianDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'technician':
            return Response({'error': 'Unauthorized'}, status=403)

        tickets = RepairTicket.objects.filter(
            technician=request.user
        ).order_by('-id')

        return Response({
            'tickets': RepairTicketSerializer(tickets, many=True).data
        })

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


#--------------------------------------
#u can register this in router with new url or add logic in existing.
#--------------------------------------
# class EmployeeTicketViewSet(viewsets.ModelViewSet):
#     # We can use the same serializer
#     serializer_class = RepairTicketSerializer
#     queryset = RepairTicket.objects.all()

#     def get_queryset(self):
#         # Filter tickets where the asset belongs to the logged-in employee
#         return RepairTicket.objects.filter(asset__assignment__employee=self.request.user).distinct()