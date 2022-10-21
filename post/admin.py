from django.contrib import admin
from .models import *

class PostAdmin(admin.ModelAdmin): 
    list_display = ('get_owner_firstName','get_owner_npToken','RecipientName','RecipientSurname','RecipientsPhone', 'added')
    search_fields = ('get_owner_npToken','RecipientName','RecipientSurname','RecipientsPhone',)
    ordering=('id','added')
    readonly_fields=('added',)

    def get_owner_firstName(self, obj): return obj.owner.firstName
    def get_owner_npToken(self, obj): return obj.owner.npToken

    class Meta:
        model = Post


admin.site.register(Post, PostAdmin)
