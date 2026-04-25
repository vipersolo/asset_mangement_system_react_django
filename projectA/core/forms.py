from django import forms
from .models import Assignment, Asset, User
from .models import InventoryItem

class AssetForm(forms.ModelForm):
    class Meta:
        model = Asset
        fields = ['name', 'type', 'serial_number', 'status', 'purchase_date']
        widgets = {
            'purchase_date': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'name': forms.TextInput(attrs={'class': 'form-control'}),
            'type': forms.TextInput(attrs={'class': 'form-control'}),
            'serial_number': forms.TextInput(attrs={'class': 'form-control'}),
            'status': forms.Select(attrs={'class': 'form-control'}),
        }


class AssignmentForm(forms.ModelForm):
    class Meta:
        model = Assignment
        fields = ['asset', 'employee', 'date_assigned']
        widgets = {
            'date_assigned': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'asset': forms.Select(attrs={'class': 'form-control'}),
            'employee': forms.Select(attrs={'class': 'form-control'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Industry Standard: Filter the dropdown at the Form level
        # This overrides the default 'all()' behavior
        self.fields['asset'].queryset = Asset.objects.filter(status='available')
        
        # Also filter to show only employees
        self.fields['employee'].queryset = User.objects.filter(role='employee')

    


from .models import RepairTicket

class RepairRequestForm(forms.ModelForm):
    class Meta:
        model = RepairTicket
        fields = ['issue']
        widgets = {
            'issue': forms.Textarea(attrs={
                'class': 'form-control', 
                'placeholder': 'Describe the problem...',
                'rows': 3
            }),
        }   




class InventoryItemForm(forms.ModelForm):
    class Meta:
        model = InventoryItem
        fields = ['item_type', 'quantity', 'threshold']
        widgets = {
            'item_type': forms.TextInput(attrs={'class': 'form-control'}),
            'quantity': forms.NumberInput(attrs={'class': 'form-control'}),
            'threshold': forms.NumberInput(attrs={'class': 'form-control'}),
        }