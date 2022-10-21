import uuid
from django.db import models
from account.models import Account




class Post(models.Model):

    PayerType_CHOICES = (
        ('Recipient', 'Отримувач'),
        ('Sender', 'Відправник'),
    )
    PaymentMethod_CHOICES = (
        ('Cash', 'Готівка'),
        ('NonCash', 'Безготівка'),
    )
    CargoType_CHOICES = (
        ('Cargo', 'Вантаж'),
        ('Documents', 'Документи'),
    )


    owner = models.ForeignKey(Account, null=True, blank=True, on_delete=models.CASCADE, verbose_name='Owner', related_name='posts_owner')
    added = models.DateTimeField(auto_now_add=True, verbose_name='Added at')

    PayerType = models.CharField(max_length=50, choices=PayerType_CHOICES, default='Recipient')
    PaymentMethod = models.CharField(max_length=50, choices=PaymentMethod_CHOICES, default='Cash')
    DateTime = models.DateField(verbose_name='Department date')
    CargoType = models.CharField(max_length=50, choices=CargoType_CHOICES, default='Cargo')
    VolumeGeneral = models.DecimalField(decimal_places=10, max_digits=12)
    Weight = models.DecimalField(decimal_places=2, max_digits=6)
    ServiceType = models.CharField(max_length=50)
    SeatsAmount = models.PositiveIntegerField()
    Description = models.CharField(max_length=200)
    Cost = models.PositiveIntegerField(verbose_name='Assessed value')
    
    RecipientName = models.CharField(max_length=50)
    RecipientSurname = models.CharField(max_length=50)

    CityRecipient = models.CharField(max_length=100)
    RecipientAddress = models.CharField(max_length=100)
    Recipient = models.CharField(max_length=100)
    ContactRecipient = models.CharField(max_length=100)
    RecipientsPhone = models.CharField(max_length=50)

    def __str__(self):
        return str(self.id)
    
    # Changing our model for the admin panel
    class Meta:
        verbose_name_plural='Posts'
        verbose_name= 'Post'
        ordering=['id']