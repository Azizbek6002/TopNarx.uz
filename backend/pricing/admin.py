from django.contrib import admin
from .models import MenuItemPrice,PriceSubmission


@admin.register(MenuItemPrice)
class MenuItemPriceAdmin(admin.ModelAdmin):
    list_display = (
        "restaurant",
        "variant",
        "price_amount",
        "is_verified",
        "source_type",
        "updated_at",
    )

    list_filter = (
        "is_verified",
        "source_type",
        "restaurant",
    )

    search_fields = (
        "restaurant__name",
        "variant__item__name",
    )

    autocomplete_fields = (
        "restaurant",
        "variant",
    )



@admin.register(PriceSubmission)
class PriceSubmissionAdmin(admin.ModelAdmin):
    list_display = ("restaurant", "variant", "submitted_price", "status", "submitted_by", "created_at")
    list_filter = ("status",)
    search_fields = ("restaurant__name", "variant__item__name", "note")
    autocomplete_fields = ("restaurant", "variant", "submitted_by", "reviewed_by")
