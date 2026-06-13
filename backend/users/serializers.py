# users/serializers.py
from django.contrib.auth import get_user_model, authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken

from places.models import Restaurant

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, default="user")

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "role"]

    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Bu email allaqachon ro'yxatdan o'tgan")
        return value

    def validate_username(self, value):
        value = value.strip()
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Bu username allaqachon band")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        validated_data["email"] = validated_data["email"].strip().lower()
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    managed_restaurant = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "phone", "managed_restaurant"]
        read_only_fields = ["id"]

    def get_managed_restaurant(self, obj):
        restaurant = Restaurant.objects.filter(owner=obj).first()
        if not restaurant:
            return None
        return {
            "id": str(restaurant.id),
            "name": restaurant.name,
            "slug": restaurant.slug,
        }


class UserProfileSerializer(serializers.ModelSerializer):
    managed_restaurant = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "role", "phone", "managed_restaurant"]

    def get_managed_restaurant(self, obj):
        restaurant = Restaurant.objects.filter(owner=obj).first()
        if not restaurant:
            return None
        return {
            "id": str(restaurant.id),
            "name": restaurant.name,
            "slug": restaurant.slug,
            "phone": restaurant.phone,
            "address_text": restaurant.address_text,
            "lat": restaurant.lat,
            "lng": restaurant.lng,
            "is_active": restaurant.is_active,
        }


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email", "").strip().lower()
        password = attrs.get("password")

        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError("Email yoki parol noto'g'ri")

        refresh = RefreshToken.for_user(user)

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserProfileSerializer(user).data,
        }