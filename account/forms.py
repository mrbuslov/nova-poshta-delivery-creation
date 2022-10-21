import imp
from django.forms import ModelForm
from account.models import Account
from django import forms
from django.utils.translation import gettext_lazy as _

class AccountForm(ModelForm):
    class Meta:
        model = Account
        fields=('firstName','lastName','phoneNumber','npToken','sender','senderRef','senderDepartmentCity','senderDepartmentCityRef','senderDepartmentAddress','senderDepartmentAddressRef')    
    
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

