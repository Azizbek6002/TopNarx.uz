from django.contrib import admin
from .models import MenuCategory, MenuItem, MenuItemVariant


@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "slug", "sort_order", "updated_at")
    search_fields = ("name", "slug")
    prepopulated_fields = {"slug": ("name",)}
    ordering = ("sort_order", "name")


class MenuItemVariantInline(admin.TabularInline):
    model = MenuItemVariant
    extra = 1


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ("name", "category", "default_unit", "is_active", "updated_at")
    list_filter = ("category", "is_active", "default_unit")
    search_fields = ("name", "normalized_name")
    inlines = [MenuItemVariantInline]


@admin.register(MenuItemVariant)
class MenuItemVariantAdmin(admin.ModelAdmin):
    list_display = ("item", "label", "size_value", "size_unit", "updated_at")
    list_filter = ("size_unit",)
    search_fields = ("item__name", "label")
    autocomplete_fields = ("item",)
