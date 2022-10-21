import imp
from django.forms import ModelForm
from post.models import Post
from django import forms
from django.utils.translation import gettext_lazy as _

class PostForm(ModelForm):

    DateTime = forms.DateTimeField(widget=forms.widgets.DateInput(format="%d.%m.%Y"), input_formats=["%d.%m.%Y"])

    class Meta:
        model = Post
        fields=('owner','PayerType','PaymentMethod','DateTime','CargoType','VolumeGeneral','Weight','ServiceType','SeatsAmount','Description','Cost','CityRecipient','RecipientAddress','Recipient','ContactRecipient','RecipientsPhone','RecipientName','RecipientSurname',)    
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

