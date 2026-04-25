# core/urls.py (or your project's main urls.py)
from django.urls import path, include
from django.contrib.auth import views as auth_views
from rest_framework.routers import DefaultRouter
from .api_views import (
    AssetViewSet, 
    InventoryViewSet, 
    AssignmentViewSet, 
    RepairTicketViewSet,
    UserViewSet
)
from . import views
from rest_framework_simplejwt.views import TokenRefreshView
from .api_views import MyTokenObtainPairView


router = DefaultRouter()
router.register(r'assets', AssetViewSet)
router.register(r'inventory', InventoryViewSet)
router.register(r'assignments', AssignmentViewSet)
router.register(r'repairs', RepairTicketViewSet)
router.register(r'users', UserViewSet)

urlpatterns = [
    # Keep your old paths here...
    path('', auth_views.LoginView.as_view(template_name='registration/login.html'),name='login'),
    path('logout/',auth_views.LogoutView.as_view(),name='logout'),
    path('dashboard/',views.dashboard_redirect,name='dashboard_redirect'),
    path('dashboard/admin/', views.admin_dashboard, name='admin_dashboard'),
    path('dashboard/employee/', views.employee_dashboard, name='employee_dashboard'),
    path('dashboard/technician/', views.technician_dashboard, name='technician_dashboard'),
    path('dashboard/technician/', views.technician_dashboard, name='technician_dashboard'),
    path('ticket/<int:ticket_id>/update/<str:new_status>/', views.update_ticket_status, name='update_ticket_status'),
    path('assets/', views.asset_list, name='asset_list'),
    path('assets/add/', views.asset_create, name='asset_create'),
    path('assets/edit/<int:pk>/', views.asset_edit, name='asset_edit'),
    path('assignments/', views.assignment_list, name='assignment_list'),
    path('assignments/new/', views.assign_asset, name='assign_asset'),
    path('assignments/return/<int:pk>/', views.return_asset, name='return_asset'),
    path('inventory/', views.inventory_list, name='inventory_list'),
    path('inventory/update/<int:pk>/<str:action>/', views.update_stock, name='update_stock'),
    path('my-assets/', views.my_assets, name='my_assets'),
    path('asset/<int:asset_id>/report/', views.report_issue, name='report_issue'),
    path('admin/repairs/', views.manage_repairs, name='manage_repairs'),
    path('admin/repairs/assign/<int:ticket_id>/', views.assign_technician, name='assign_technician'),
    path('inventory/add/', views.inventory_create, name='inventory_create'),
    

    # New API entry point
    path('api/', include(router.urls)),
    # Login / Get Token
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Refresh Token
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]