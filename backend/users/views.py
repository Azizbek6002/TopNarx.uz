# users/views.py
from rest_framework import status, generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework import generics, permissions
from rest_framework.response import Response

from .serializers import LoginSerializer, RegisterSerializer, UserProfileSerializer
from .models import User
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, UserProfileSerializer


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]



class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data)


class UserProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user


class UserListView(generics.ListAPIView):
    """Admin uchun userlar ro'yxati"""
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer

    def get_queryset(self):
        # Faqat admin ko'ra oladi
        if self.request.user.role != 'admin':
            return User.objects.none()
        return User.objects.all()


class ProfileView:
    pass