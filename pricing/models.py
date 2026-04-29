from django.db import models
from django.conf import settings

from common.models import BaseModel
from places.models import Restaurant
from menu.models import MenuItemVariant


class MenuItemPrice(BaseModel):
    SOURCE_CHOICES = (
        ("admin", "Admin"),
        ("restaurant", "Restaurant"),
        ("community", "Community"),
    )

    restaurant = models.ForeignKey(
        Restaurant,
        on_delete=models.CASCADE,
        related_name="prices"
    )

    variant = models.ForeignKey(
        MenuItemVariant,
        on_delete=models.CASCADE,
        related_name="prices"
    )

    price_amount = models.IntegerField()  # so'mda
    currency = models.CharField(max_length=10, default="UZS")

    is_verified = models.BooleanField(default=False)
    source_type = models.CharField(
        max_length=20,
        choices=SOURCE_CHOICES,
        default="admin"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["restaurant", "variant"],
                name="uniq_restaurant_variant_price"
            )
        ]

        indexes = [
            models.Index(fields=["restaurant"]),
            models.Index(fields=["variant"]),
            models.Index(fields=["price_amount"]),
        ]

    def __str__(self):
        return f"{self.restaurant} - {self.variant} : {self.price_amount}"



class PriceSubmission(BaseModel):
    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    )

    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="submissions")
    variant = models.ForeignKey(MenuItemVariant, on_delete=models.CASCADE, related_name="submissions")

    submitted_price = models.IntegerField()
    note = models.CharField(max_length=255, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    submitted_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="price_submissions",
    )

    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_price_submissions",
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["restaurant"]),
            models.Index(fields=["variant"]),
        ]

    def __str__(self):
        return f"{self.restaurant} {self.variant} -> {self.submitted_price} ({self.status})"


class FavoriteVariant(BaseModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favorite_variants"
    )
    variant = models.ForeignKey(
        MenuItemVariant,
        on_delete=models.CASCADE,
        related_name="favorited_by"
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "variant"], name="uniq_user_fav_variant")
        ]

    def __str__(self):
        return f"{self.user} ❤️ {self.variant}"
