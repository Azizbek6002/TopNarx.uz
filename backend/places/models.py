import uuid
from django.db import models
from common.models import BaseModel
from config import settings


class Restaurant(BaseModel):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True)
    phone = models.CharField(max_length=30, blank=True)
    address_text = models.CharField(max_length=255, blank=True)

    # MVP: PostGIS emas, oddiy lat/lng
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    is_active = models.BooleanField(default=True)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True,

        related_name = "restaurant"


    )

    class Meta:
        ordering = ["name"]
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["is_active"]),
        ]

    def __str__(self):
        return self.name


class Tag(BaseModel):
    name = models.CharField(max_length=50, unique=True)
    slug = models.SlugField(max_length=60, unique=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class RestaurantTag(BaseModel):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="tag_links")
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name="restaurant_links")

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["restaurant", "tag"], name="uniq_restaurant_tag")
        ]

    def __str__(self):
        return f"{self.restaurant} -> {self.tag}"


class Feature(BaseModel):
    name = models.CharField(max_length=50, unique=True)  # Wifi
    slug = models.SlugField(max_length=60, unique=True)  # wifi

    def __str__(self):
        return self.name


class RestaurantFeature(BaseModel):
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE, related_name="features")
    feature = models.ForeignKey(Feature, on_delete=models.CASCADE, related_name="restaurants")
    weight = models.IntegerField(default=1)  # 1..10

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["restaurant", "feature"], name="uniq_restaurant_feature")
        ]

    def __str__(self):
        return f"{self.restaurant} - {self.feature} ({self.weight})"
