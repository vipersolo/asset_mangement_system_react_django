from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

# Create your models here.
class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin','Admin'),
        ('employee','Employee'),
        ('technician','Technician')
    )

    role = models.CharField(max_length=10, choices=ROLE_CHOICES)


class Asset(models.Model):
        STATUS_CHOICES = (
              ('available','Available'),
              ('assigned','Assingned'),
              ('repair','Repair'),
        )

        name = models.CharField(max_length=100)
        type = models.CharField(max_length=100)
        serial_number = models.CharField(max_length=100, unique=True)
        status = models.CharField(max_length=50, choices=STATUS_CHOICES)
        purchase_date = models.DateField()

        def __str__(self):
              return self.name
        
class InventoryItem(models.Model):
      item_type = models.CharField(max_length=100)
      quantity = models.IntegerField()
      threshold = models.IntegerField()

      def __str__(self):
            return '{self.item_type}-{quantity}'
      

class Assignment(models.Model):
      asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
      employee = models.ForeignKey(User , on_delete=models.CASCADE)
      date_assigned = models.DateField()
      date_returned = models.DateField(null=True, blank=True)

      def clean(self):
            active_assignment = Assignment.objects.filter(
                  asset=self.asset,
                  date_returned__isnull=True
            )

            if self.pk:
                  active_assignment = active_assignment.exclude(pk=self.pk)

            if active_assignment.exists():
                  raise ValidationError("This asset is already assigned and not yet returned.")

      def save(self, *args, **kwargs):
            self.full_clean()  # IMPORTANT: ensures clean() runs
            # 2. If this is a new assignment (no PK yet)
            if not self.pk:
                  self.asset.status = 'assigned'
                  self.asset.save()
            super().save(*args, **kwargs)

      def __str__(self):
            return f"{self.asset} → {self.employee}"

      

class RepairTicket(models.Model):
      STATUS_CHOICE = (
            ('pending','Pending'),
            ('in_progress','In Progress'),
            ('completed','Completed'),
      )

      asset = models.ForeignKey(Asset, on_delete=models.CASCADE)
      issue = models.TextField()
      status = models.CharField(max_length=50,choices=STATUS_CHOICE)
      technician = models.ForeignKey(User, on_delete=models.SET_NULL,null=True,blank=True)

      def clean(self):
        # ADD THIS CHECK: If asset is missing, don't run the validation yet
        if not hasattr(self, 'asset') or self.asset is None:
            return

        active_tickets = RepairTicket.objects.filter(
            asset=self.asset,
            status__in=['pending', 'in_progress']
        )

        if self.pk:
            active_tickets = active_tickets.exclude(pk=self.pk)

        if active_tickets.exists():
            raise ValidationError("This asset already has an active repair ticket.")
      
      def save(self, *args,**kwargs):
            self.full_clean()
            super().save(*args, **kwargs)

      def __str__(self):
            return f"{self.asset} - {self.status}"
      

      

