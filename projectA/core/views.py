from django.http import HttpResponse
from django.shortcuts import render,redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from .models import Asset, RepairTicket, InventoryItem, User
from .decorators import role_required
from django.db import models 
from .models import Asset
from .forms import AssetForm,AssignmentForm
from .models import Assignment
from django.utils import timezone
from django.db.models import F
from .forms import RepairRequestForm
from .models import RepairTicket
from .forms import InventoryItemForm
from django.core.exceptions import ValidationError


def home(request):
    return render(request, 'core/home.html')

@login_required
def dashboard_redirect(request):
    if request.user.role == 'admin':
        return redirect('admin_dashboard')
    elif request.user.role == 'technician':
        return redirect('technician_dashboard')
    else:
        return redirect('employee_dashboard')
    

@login_required
@role_required(allowed_roles=['admin'])
def admin_dashboard(request):
    # Summary Stats
    total_assets = Asset.objects.count()
    pending_repairs = RepairTicket.objects.filter(status='pending').count()
    low_stock = InventoryItem.objects.filter(quantity__lte=F('threshold')).count()
    
    # Data for Charts (Asset Distribution)
    # Counts how many assets are 'Available', 'Assigned', etc.
    status_counts = {
        'Available': Asset.objects.filter(status='available').count(),
        'Assigned': Asset.objects.filter(status='assigned').count(),
        'Repair': Asset.objects.filter(status='repair').count(),
    }

    context = {
        'total_assets': total_assets,
        'pending_repairs': pending_repairs,
        'low_stock': low_stock,
        'chart_labels': list(status_counts.keys()),
        'chart_data': list(status_counts.values()),
    }
    return render(request, 'core/admin_dashboard.html', context)


@login_required
@role_required(allowed_roles=['employee'])
def employee_dashboard(request):
    # 1. Get current active assignments for this employee
    # We use select_related to get asset details in a single database hit
    my_assignments = Assignment.objects.filter(
        employee=request.user, 
        date_returned__isnull=True
    ).select_related('asset')

    # 2. Get tickets for assets currently assigned to this employee
    # We look for tickets where the asset is one of the user's currently assigned assets
    assigned_asset_ids = my_assignments.values_list('asset_id', flat=True)
    
    my_tickets = RepairTicket.objects.filter(
        asset_id__in=assigned_asset_ids
    ).order_by('-id')

    context = {
        'my_assignments': my_assignments,
        'my_tickets': my_tickets,
    }
    return render(request, 'core/employee_dashboard.html', context)




@login_required
@role_required(allowed_roles=['technician'])
def technician_dashboard(request):
    # Only show tickets specifically assigned to the logged-in technician
    tickets = RepairTicket.objects.filter(technician=request.user).order_by('-id')

    context = {
        'tickets': tickets,
    }
    return render(request, 'core/technician_dashboard.html', context)

@login_required
@role_required(allowed_roles=['technician'])
def update_ticket_status(request, ticket_id, new_status):
    ticket = get_object_or_404(RepairTicket, id=ticket_id)
    
    # Update status and ensure the technician is assigned to it
    ticket.status = new_status
    if not ticket.technician:
        ticket.technician = request.user
    
    ticket.save()

    # If completed, we should also update the Asset status back to 'available'
    if new_status == 'completed':
        asset = ticket.asset
        asset.status = 'available'
        asset.save()
        
    return redirect('technician_dashboard')


@login_required
@role_required(allowed_roles=['admin'])
def asset_list(request):
    assets = Asset.objects.all().order_by('-purchase_date')
    return render(request, 'assets/asset_list.html', {'assets': assets})

@login_required
@role_required(allowed_roles=['admin'])
def asset_create(request):
    if request.method == 'POST':
        form = AssetForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('asset_list')
    else:
        form = AssetForm()
    return render(request, 'assets/asset_form.html', {'form': form, 'title': 'Add New Asset'})

@login_required
@role_required(allowed_roles=['admin'])
def asset_edit(request, pk):
    asset = get_object_or_404(Asset, pk=pk)
    if request.method == 'POST':
        form = AssetForm(request.POST, instance=asset)
        if form.is_valid():
            form.save()
            return redirect('asset_list')
    else:
        form = AssetForm(instance=asset)
    return render(request, 'assets/asset_form.html', {'form': form, 'title': 'Edit Asset'})



@login_required
@role_required(allowed_roles=['admin'])
def assignment_list(request):
    # Get only active assignments (not yet returned)
    active_assignments = Assignment.objects.filter(date_returned__isnull=True)
    return render(request, 'assignments/assignment_list.html', {'assignments': active_assignments})

@login_required
@role_required(allowed_roles=['admin'])
def assign_asset(request):
    if request.method == 'POST':
        form = AssignmentForm(request.POST) # Using the filtered form here
        if form.is_valid():
            assignment = form.save()
            # IMPORTANT: We must update the asset status to 'assigned' 
            # so it disappears from the list for the next person
            asset = assignment.asset
            asset.status = 'assigned'
            asset.save()
            return redirect('assignment_list')
    else:
        form = AssignmentForm() # Using the filtered form here
    return render(request, 'assignments/assignment_form.html', {'form': form})

@login_required
@role_required(allowed_roles=['admin'])
def return_asset(request, pk):
    assignment = get_object_or_404(Assignment, pk=pk)
    assignment.date_returned = timezone.now().date()
    assignment.save()

    # Make the asset 'available' again
    asset = assignment.asset
    asset.status = 'available'
    asset.save()
    
    return redirect('assignment_list')


@login_required
@role_required(allowed_roles=['admin'])
def inventory_list(request):
    """
    Displays all consumable items.
    Items with quantity <= threshold will be flagged in the template.
    """
    items = InventoryItem.objects.all().order_by('item_type')
    return render(request, 'inventory/inventory_list.html', {'items': items})

@login_required
@role_required(allowed_roles=['admin'])
def update_stock(request, pk, action):
    """
    Quickly increment or decrement stock levels.
    """
    item = get_object_or_404(InventoryItem, pk=pk)
    
    if action == 'add':
        item.quantity += 1
    elif action == 'remove' and item.quantity > 0:
        item.quantity -= 1
        
    item.save()
    return redirect('inventory_list')


@login_required
@role_required(allowed_roles=['employee'])
def my_assets(request):
    # Fetch only active assignments for the logged-in user
    assignments = Assignment.objects.filter(
        employee=request.user, 
        date_returned__isnull=True
    ).select_related('asset')
    
    return render(request, 'employee/my_assets.html', {'assignments': assignments})


@login_required
@role_required(allowed_roles=['employee'])
def report_issue(request, asset_id):
    asset = get_object_or_404(Asset, id=asset_id)
    
    if request.method == 'POST':
        form = RepairRequestForm(request.POST)
        if form.is_valid():
            # commit=False creates the object in memory
            ticket = form.save(commit=False)
            
            # Now we attach the missing pieces
            ticket.asset = asset
            ticket.status = 'pending'
            
            try:
                ticket.save()  # triggers full_clean()
                
                asset.status = 'repair'
                asset.save()
                
                return redirect('employee_dashboard')

            except ValidationError as e:
                form.add_error(None, e.messages[0])  # attach error to form
    else:
        form = RepairRequestForm()
        
    return render(request, 'employee/report_issue.html', {'form': form, 'asset': asset})



@login_required
@role_required(allowed_roles=['admin'])
def manage_repairs(request):
    # Get all tickets that don't have a technician assigned yet
    unassigned_tickets = RepairTicket.objects.filter(technician__isnull=True)
    # Get all tickets currently in progress
    active_tickets = RepairTicket.objects.filter(technician__isnull=False).exclude(status='completed')
    
    return render(request, 'admin/manage_repairs.html', {
        'unassigned': unassigned_tickets,
        'active': active_tickets
    })

@login_required
@role_required(allowed_roles=['admin'])
def assign_technician(request, ticket_id):
    ticket = get_object_or_404(RepairTicket, id=ticket_id)
    technicians = User.objects.filter(role='technician')

    if request.method == 'POST':
        tech_id = request.POST.get('technician_id')
        technician = get_object_or_404(User, id=tech_id)
        ticket.technician = technician
        ticket.status = 'pending' # Or 'in_progress'
        ticket.save()
        return redirect('manage_repairs')

    return render(request, 'admin/assign_tech_form.html', {
        'ticket': ticket,
        'technicians': technicians
    })


@login_required
@role_required(allowed_roles=['admin'])
def inventory_create(request):
    if request.method == 'POST':
        form = InventoryItemForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('inventory_list')
    else:
        form = InventoryItemForm()
    return render(request, 'inventory/inventory_form.html', {'form': form})