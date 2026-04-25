from django.contrib import admin
from .models import Asset, InventoryItem,Assignment, RepairTicket, User
from django.contrib.auth.admin import UserAdmin

# Register your models here.


class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'is_staff')

    # Add role field in user edit page
    fieldsets = UserAdmin.fieldsets + (
        ('Role Info', {'fields': ('role',)}),
    )

    # Add role field in user creation page
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Role Info', {'fields': ('role',)}),
    )

    # tuple -> tuple -> ui title and object -> object -> key and tuple field


admin.site.register(User, CustomUserAdmin)

@admin.register(Asset)
class AssetAdmin(admin.ModelAdmin):
    list_display = ('name','type','serial_number','status')
    search_fields = ('name','serial_number')
    list_filter = ('status','type')


@admin.register(InventoryItem)
class InventoryAdmin(admin.ModelAdmin):
    list_display = ('item_type','quantity','threshold')

@admin.register(Assignment)
class AssignmentAdmin(admin.ModelAdmin):
    list_display = ('asset', 'employee', 'date_assigned', 'date_returned')
    list_filter = ('date_assigned',)
    
@admin.register(RepairTicket)
class RepairAdmin(admin.ModelAdmin):
    list_display = ('asset', 'status', 'technician')

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "technician":
            kwargs["queryset"] = User.objects.filter(role='technician')
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

