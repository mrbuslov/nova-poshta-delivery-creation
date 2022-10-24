from asyncio import constants
from rest_framework import serializers
from account.models import Account
from django.contrib.auth import authenticate

from post.models import Post


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Account
        fields = ['id','email','firstName','lastName','phoneNumber','npToken','sender','senderRef','senderDepartmentCity','senderDepartmentCityRef','senderDepartmentAddress','senderDepartmentAddressRef','date_joined',]



class PostSerializer(serializers.ModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.email')

    class Meta:
        model = Post
        fields = ['id','owner','added','PayerType','PaymentMethod','DateTime','CargoType','VolumeGeneral','Weight','ServiceType','SeatsAmount','Description','Cost','CityRecipient','RecipientAddress','Recipient','ContactRecipient','RecipientsPhone',]


class RegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(
        max_length=128,
        min_length=8,
        write_only=True # cannot be read by the client side
    )

    class Meta:
        model = Account
        fields = ['email', 'password', 'npToken']

    def create(self, validated_data):
        return Account.objects.create_user(**validated_data)




class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(max_length=255)
    password = serializers.CharField(max_length=128, write_only=True)
    # token = serializers.CharField(max_length=255, read_only=True)

    def validate(self, data):
        email = data.get('email', None)
        password = data.get('password', None)

        if email is None:
            raise serializers.ValidationError(
                'An email address is required to log in.'
            )

        if password is None:
            raise serializers.ValidationError(
                'A password is required to log in.'
            )


        user = authenticate(username=email, password=password)

        if user is None:
            raise serializers.ValidationError(
                'A user with this email and password was not found.'
            )

        # if not user.is_active:
        #     raise serializers.ValidationError(
        #         'This user has been deactivated.'
        #     )

        return {
            'email': user.email,
            # 'username': user.username,
            # 'token': user.token
        }




from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
# to return to Angular email and token
class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['email'] = user.email
        token['npToken'] = user.npToken

        return token