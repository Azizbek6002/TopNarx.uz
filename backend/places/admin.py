from django.contrib import admin
from .models import Restaurant, Tag, RestaurantTag


@admin.register(Restaurant)
class RestaurantAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "is_active", "lat", "lng", "updated_at")
    list_filter = ("is_active",)
    search_fields = ("name", "slug", "address_text", "phone")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("name",)


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "updated_at")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("name",)


@admin.register(RestaurantTag)
class RestaurantTagAdmin(admin.ModelAdmin):
    list_display = ("restaurant", "tag", "created_at")
    search_fields = ("restaurant__name", "tag__name")
    autocomplete_fields = ("restaurant", "tag")
