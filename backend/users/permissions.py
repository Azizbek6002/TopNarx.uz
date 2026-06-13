# users/permissions.py
from rest_framework.permissions import BasePermission


class IsOwner(BasePermission):
    message = "Faqat owner foydalanuvchilar uchun."

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == "owner"


class IsAdmin(BasePermission):
    message = "Faqat admin foydalanuvchilar uchun."

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == "admin"


class IsOwnerOrAdmin(BasePermission):
    message = "Faqat owner yoki admin foydalanuvchilar uchun."

    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ["owner", "admin"]
        )