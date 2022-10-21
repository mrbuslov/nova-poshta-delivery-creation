from asyncio import constants
import imp
from rest_framework.response import Response
from django.shortcuts import render
from rest_framework import generics, permissions, viewsets, status

from account.forms import AccountForm  
from . import serializers
from account.models import Account
import api.permissions as overrided_permissions
from post.models import Post
from django.shortcuts import get_object_or_404
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from rest_framework.views import APIView
from post.forms import PostForm


class UserViewSet(viewsets.ModelViewSet): 
    queryset = Account.objects.all()
    serializer_class = serializers.UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    # permission_classes = [permissions.AllowAny]
    # authentication_classes = [JSONWebTokenAuthentication, SessionAuthentication, BasicAuthentication]


    def retrieve(self, request, pk=None):
        queryset = Account.objects.all()
        user = get_object_or_404(queryset, npToken=pk)
        serializer = serializers.UserSerializer(user)
        return Response(serializer.data)

    def update(self, request, pk=None):
        queryset = Account.objects.all()
        user = get_object_or_404(queryset, npToken=pk)
        form = AccountForm(data=request.data, instance=user)
        if form.is_valid():
            print('form valid')
            form.save()
        else:
            print('form is not valid')
        # user.name = request.data.get("name")
        # user.save()
        # print(request.data)

        # serializer = self.get_serializer(user)
        # serializer.is_valid(raise_exception=True)
        # self.perform_update(serializer)

        serializer = serializers.UserSerializer(user)
        return Response(serializer.data)
    


    # # Add this code block
    # def get_permissions(self):
    #     permission_classes = []
    #     if self.action == 'create':
    #         permission_classes = [permissions.AllowAny]
    #     elif self.action == 'retrieve' or self.action == 'update' or self.action == 'partial_update':
    #         permission_classes = [overrided_permissions.IsLoggedInUserOrAdmin]
    #     elif self.action == 'list' or self.action == 'destroy':
    #         permission_classes = [overrided_permissions.IsAdminUser]
    #     return [permission() for permission in permission_classes]



class PostViewSet(viewsets.ModelViewSet): 
    queryset = Post.objects.all()
    serializer_class = serializers.UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request):
        data = request.data
        queryset = Account.objects.all()
        user = get_object_or_404(queryset, npToken=data['npToken'])

        # print(data)
        form = PostForm(data=data['postData'])
        if form.is_valid():
            post = form.save(commit=False)
            post.owner = user
            post = form.save()
            
            serializer = serializers.PostSerializer(post)
            return Response(serializer.data)

        return Response({'message':'fail','error':True,'code':500,'result':{}})


class RegistrationAPIView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.RegistrationSerializer

    def post(self, request):
        user = request.data.get('user', {})

        serializer = self.serializer_class(data=user)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class LoginAPIView(APIView):
    permission_classes = (permissions.AllowAny,)
    serializer_class = serializers.LoginSerializer

    def post(self, request):
        user = request.data.get('user', {})

        serializer = self.serializer_class(data=user)
        serializer.is_valid(raise_exception=True)

        return Response(serializer.data, status=status.HTTP_200_OK)