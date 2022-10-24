from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
import uuid

class MyAccountManager(BaseUserManager):
	def create_user(self, email, password, npToken):
		if not email: raise ValueError('Enter email')

		user = self.model(
			email=self.normalize_email(email),
			npToken=npToken,
		)

		user.set_password(password)
		user.is_active = True
		user.save(using=self._db)
		return user

	def create_superuser(self, email, password):
		user = self.create_user(
			email=self.normalize_email(email),
			password=password,
		)
		user.is_admin = True
		user.is_staff = True
		user.is_superuser = True
		user.is_active = True
		user.save(using=self._db)
		return user



class Account(AbstractBaseUser, PermissionsMixin):
	email 					= models.EmailField(verbose_name="email", max_length=60, unique=True)
	firstName				= models.CharField(max_length=50, blank=True)
	lastName				= models.CharField(max_length=50, blank=True)
	phoneNumber				= models.CharField(max_length=50, null=True, blank=True)

	npToken					= models.CharField(max_length=50, null=True, blank=True)
	sender					= models.CharField(max_length=50, null=True, blank=True)
	senderRef				= models.CharField(max_length=50, null=True, blank=True)
	senderDepartmentCity	= models.CharField(max_length=100, null=True, blank=True)
	senderDepartmentCityRef			= models.CharField(max_length=50, null=True, blank=True)
	senderDepartmentAddress			= models.CharField(max_length=100, null=True, blank=True)
	senderDepartmentAddressRef		= models.CharField(max_length=50, null=True, blank=True)
	
	date_joined				= models.DateTimeField(verbose_name='Registration date', auto_now_add=True)
	last_login				= models.DateTimeField(verbose_name='Last Login', auto_now=True)
	is_active				= models.BooleanField(default=False)
	is_admin				= models.BooleanField(default=False)
	is_staff				= models.BooleanField(default=False)
	is_superuser			= models.BooleanField(default=False)

	USERNAME_FIELD = 'email'
	objects = MyAccountManager()

	def __str__(self):
		return self.email
	
	def get_username_from_email(self):
		return self.email.split('@')[0]


	# @property
	# def token(self):
	# 	return self._generate_jwt_token()

	# def _generate_jwt_token(self):
	# 	dt = datetime.now() + timedelta(days=1)

	# 	token = jwt.encode({
	# 		'id': self.pk,
	# 		'exp': int(dt.strftime('%s'))
	# 	}, settings.SECRET_KEY, algorithm='HS256')

	# 	return token.decode('utf-8')