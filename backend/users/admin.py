# users/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as DjangoUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User


@admin.register(User)
class UserAdmin(DjangoUserAdmin):
    model = User

    list_display = ("id", "email", "username", "role", "is_staff", "is_active")
    list_filter = ("role", "is_staff", "is_superuser", "is_active", "groups")
    search_fields = ("email", "username")
    ordering = ("email",)
    list_per_page = 25
    filter_horizontal = ("groups", "user_permissions")

    # managed_restaurant field bor-yo‘qligini tekshiramiz
    has_managed_restaurant = any(f.name == "managed_restaurant" for f in User._meta.get_fields())

    base_fieldsets = [
        (None, {"fields": ("username", "password")}),
        (_("Contact"), {"fields": ("email", "phone")}),
        (_("Permissions"), {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
    ]

    if has_managed_restaurant:
        base_fieldsets.insert(2, (_("Restaurant"), {"fields": ("managed_restaurant",)}))

    fieldsets = tuple(base_fieldsets)

    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("username", "email", "role", "phone", "password1", "password2", "is_staff", "is_active"),
        }),
    )